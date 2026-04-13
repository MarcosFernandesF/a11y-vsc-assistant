import * as vscode from 'vscode';
import { RuleError } from './rules/types';
import type { WcagReferenceKey } from './rules/wcagReferences';

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

export type A11yTreeItem = A11yErrorCategoryTreeItem | A11yErrorTreeItem;

export class A11yErrorCategoryTreeItem extends vscode.TreeItem {
  constructor(
    public readonly categoryName: string,
    public readonly children: A11yErrorTreeItem[]
  ) {
    super(categoryName, vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${children.length} erro(s)`;
    this.contextValue = 'a11yErrorCategory';
    this.iconPath = new vscode.ThemeIcon('folder-library');
  }
}

/**
 * Item exibido no painel de resumo de erros com contexto para navegacao.
 */
export class A11yErrorTreeItem extends vscode.TreeItem {
  public readonly uri: vscode.Uri;
  public readonly range: vscode.Range;

  constructor(document: vscode.TextDocument, error: RuleError) {
    const startPosition = document.positionAt(error.index);
    const endPosition = createEndPosition(document, startPosition, error);

    const panelTitle = extractPanelTitle(error.message);

    super(panelTitle, vscode.TreeItemCollapsibleState.None);

    this.uri = document.uri;
    this.range = new vscode.Range(startPosition, endPosition);
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
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private categoryItems: A11yErrorCategoryTreeItem[] = [];

  setErrors(document: vscode.TextDocument, errors: RuleError[]): void {
    const grouped = new Map<string, A11yErrorTreeItem[]>();

    for (const error of errors) {
      const category = getErrorCategory(error);
      const categoryChildren = grouped.get(category) ?? [];
      categoryChildren.push(new A11yErrorTreeItem(document, error));
      grouped.set(category, categoryChildren);
    }

    this.categoryItems = Array.from(grouped.entries())
      .map(([categoryName, children]) => new A11yErrorCategoryTreeItem(categoryName, children))
      .sort((a, b) => b.children.length - a.children.length || a.categoryName.localeCompare(b.categoryName));

    this.onDidChangeTreeDataEmitter.fire();
  }

  clear(): void {
    this.categoryItems = [];
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: A11yTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: A11yTreeItem): vscode.ProviderResult<A11yTreeItem[]> {
    if (!element) {
      return this.categoryItems;
    }

    if (element instanceof A11yErrorCategoryTreeItem) {
      return element.children;
    }

    return [];
  }

  getTotalErrors(): number {
    return this.categoryItems.reduce((total, category) => total + category.children.length, 0);
  }
}

/*
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

/*
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

function getErrorCategory(error: RuleError): string {
  if (error.wcagReferenceKey) {
    return ERROR_CATEGORY_BY_REFERENCE[error.wcagReferenceKey];
  }

  return 'Outros Erros';
}