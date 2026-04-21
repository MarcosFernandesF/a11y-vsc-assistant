import * as vscode from 'vscode';
import { RuleError } from './rules/types';
import type { WcagReferenceKey } from './rules/wcagReferences';

export type A11yPanelExportEntry = {
  category: string;
  summary: string;
  details: string;
  line: number;
  column: number;
  codeSnippet: string;
  wcagReferenceKey?: WcagReferenceKey;
};

const ERROR_CATEGORY_BY_REFERENCE: Record<WcagReferenceKey, string> = {
  duplicateIds: 'Erros de Estrutura',
  headersHierarchy: 'Erros de Estrutura',
  pageLanguage: 'Erros de Estrutura',
  imageAlt: 'Erros de Conteudo',
  focusVisualRemovalCss: 'Erros de Foco e Navegacao',
  focusVisualRemovalHtml: 'Erros de Foco e Navegacao',
  nonInteractiveClickable: 'Erros de Interacao',
  justifyText: 'Erros de Apresentacao Visual',
  zoomCapability: 'Erros de Zoom e Viewport',
};

const CATEGORY_ICON_BY_NAME: Record<string, string> = {
  'Erros de Estrutura': 'structure.svg',
  'Erros de Conteudo': 'content.svg',
  'Erros de Foco e Navegacao': 'focus.svg',
  'Erros de Interacao': 'interaction.svg',
  'Erros de Apresentacao Visual': 'visual.svg',
  'Erros de Zoom e Viewport': 'zoom.svg',
  'Outros Erros': 'others.svg',
};

export type A11yTreeItem = A11yErrorCategoryTreeItem | A11yErrorTreeItem;

export class A11yErrorCategoryTreeItem extends vscode.TreeItem {
  constructor(
    public readonly categoryName: string,
    public readonly children: A11yErrorTreeItem[],
    iconPath: vscode.Uri | vscode.ThemeIcon
  ) {
    super(categoryName, vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${children.length} erro(s)`;
    this.contextValue = 'a11yErrorCategory';
    this.iconPath = iconPath;
  }
}

/**
 * Item exibido no painel de resumo de erros com contexto para navegacao.
 */
export class A11yErrorTreeItem extends vscode.TreeItem {
  public readonly uri: vscode.Uri;
  public readonly range: vscode.Range;
  public readonly detailsMessage: string;
  public readonly panelSummary: string;
  public readonly wcagReferenceKey?: WcagReferenceKey;

  constructor(document: vscode.TextDocument, error: RuleError) {
    const startPosition = document.positionAt(error.index);
    const endPosition = createEndPosition(document, startPosition, error);

    const panelTitle = extractPanelTitle(error.message);

    super(panelTitle, vscode.TreeItemCollapsibleState.None);

    this.uri = document.uri;
    this.range = new vscode.Range(startPosition, endPosition);
    this.panelSummary = panelTitle;
    this.detailsMessage = error.message;
    this.wcagReferenceKey = error.wcagReferenceKey;
    this.description = `Linha ${startPosition.line + 1}, Coluna ${startPosition.character + 1}`;
    this.tooltip = new vscode.MarkdownString([
      `**Resumo:** ${panelTitle}`,
      `**Detalhes:**`,
      error.message,
      `**Local:** linha ${startPosition.line + 1}, coluna ${startPosition.character + 1}`,
    ].join('\n\n'));
    this.contextValue = 'a11yError';
    this.command = {
      command: 'a11y-vsc-assistant.revealErrorFromPanel',
      title: 'Ir para erro',
      arguments: [this],
    };
    this.iconPath = new vscode.ThemeIcon('warning');
  }
}

/**
 * Provedor de dados do TreeView para apresentar o resumo de erros.
 */
export class A11yErrorsTreeDataProvider implements vscode.TreeDataProvider<A11yTreeItem> {
  constructor(private readonly extensionUri: vscode.Uri) { }

  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private categoryItems: A11yErrorCategoryTreeItem[] = [];

  /**
   * Atualiza o estado interno do painel com os erros do documento ativo,
   * agrupando por categoria para manter a mesma estrutura usada na exportacao.
   */
  setErrors(document: vscode.TextDocument, errors: RuleError[]): void {
    const grouped = new Map<string, A11yErrorTreeItem[]>();

    for (const error of errors) {
      const category = getErrorCategory(error);
      const categoryChildren = grouped.get(category) ?? [];
      categoryChildren.push(new A11yErrorTreeItem(document, error));
      grouped.set(category, categoryChildren);
    }

    this.categoryItems = Array.from(grouped.entries())
      .map(([categoryName, children]) => {
        const iconPath = this.getCategoryIconPath(categoryName);
        return new A11yErrorCategoryTreeItem(categoryName, children, iconPath);
      })
      .sort((a, b) => b.children.length - a.children.length || a.categoryName.localeCompare(b.categoryName));

    this.onDidChangeTreeDataEmitter.fire();
  }

  /**
   * Limpa o painel de resumo e remove os erros do documento atual.
   */
  clear(): void {
    this.categoryItems = [];
    this.onDidChangeTreeDataEmitter.fire();
  }

  /**
   * Retorna o TreeItem associado ao elemento recebido pelo TreeView.
   */
  getTreeItem(element: A11yTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Resolve a hierarquia exibida no painel de resumo.
   * Sem elemento, retorna as categorias; com categoria, retorna os erros filhos.
   */
  getChildren(element?: A11yTreeItem): vscode.ProviderResult<A11yTreeItem[]> {
    if (!element) {
      return this.categoryItems;
    }

    if (element instanceof A11yErrorCategoryTreeItem) {
      return element.children;
    }

    return [];
  }

  /**
   * Soma todos os erros atualmente exibidos no painel.
   */
  getTotalErrors(): number {
    return this.categoryItems.reduce((total, category) => total + category.children.length, 0);
  }

  /**
   * Converte os itens do painel em um payload pronto para exportacao.
   */
  getExportEntries(document: vscode.TextDocument): A11yPanelExportEntry[] {
    return this.categoryItems.flatMap(categoryItem =>
      categoryItem.children.map(errorItem => ({
        category: categoryItem.categoryName,
        summary: errorItem.panelSummary,
        details: errorItem.detailsMessage,
        line: errorItem.range.start.line + 1,
        column: errorItem.range.start.character + 1,
        codeSnippet: getCodeSnippet(document, errorItem.range),
        wcagReferenceKey: errorItem.wcagReferenceKey,
      }))
    );
  }

  /**
   * Resolve o icone da categoria com base no catalogo local de assets.
   */
  private getCategoryIconPath(categoryName: string): vscode.Uri | vscode.ThemeIcon {
    const fileName = CATEGORY_ICON_BY_NAME[categoryName];

    if (!fileName) {
      return new vscode.ThemeIcon('folder-library');
    }

    return vscode.Uri.joinPath(this.extensionUri, 'media', 'categories', fileName);
  }
}

/**
 * Calcula a posicao final do range do erro com base no indice inicial e no
 * tamanho da tag, garantindo pelo menos um caractere valido para destaque.
 */
function createEndPosition(document: vscode.TextDocument, startPosition: vscode.Position, error: RuleError): vscode.Position {
  const textLength = document.getText().length;
  const startOffset = document.offsetAt(startPosition);
  const rawTagLength = error.tagLength ?? error.tag?.length ?? 0;
  let endOffset = Math.max(startOffset, Math.min(startOffset + Math.max(rawTagLength, 1), textLength));

  if (endOffset === startOffset && startOffset < textLength) {
    endOffset = startOffset + 1;
  }

  return document.positionAt(endOffset);
}

/**
 * Gera um titulo curto e legivel para o painel a partir da mensagem completa,
 * removendo quebras de linha, blocos auxiliares e prefixos de lista.
 */
function extractPanelTitle(message: string): string {
  const lines = message
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('['));

  if (lines.length === 0) {
    return message.replace(/\s+/g, ' ').trim();
  }

  return lines[0].replace(/^-\s*/, '');
}

/**
 * Classifica o erro em uma categoria de painel e exportacao com base na chave WCAG.
 */
function getErrorCategory(error: RuleError): string {
  if (error.wcagReferenceKey) {
    return ERROR_CATEGORY_BY_REFERENCE[error.wcagReferenceKey];
  }

  return 'Outros Erros';
}

/**
 * Extrai um trecho legivel do codigo para ser exibido no painel e no export.
 */
function getCodeSnippet(document: vscode.TextDocument, range: vscode.Range): string {
  const lineText = document.lineAt(range.start.line).text.trim();

  if (lineText.length > 0) {
    return lineText;
  }

  const snippet = document.getText(range).trim();

  return snippet.length > 0 ? snippet : 'Trecho indisponivel';
}