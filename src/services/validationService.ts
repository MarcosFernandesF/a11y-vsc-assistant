import * as vscode from 'vscode';
import { RuleEngine } from '../rules/core/engine';
import { allRules } from '../rules/core/registry';
import { RuleError, RuleLanguage } from '../rules/core/types';
import { getWcagReference } from '../rules/core/wcagReferences';
import { A11yErrorsTreeDataProvider, A11yTreeItem } from '../providers/errorSummaryProvider';
import { createSafeRange } from '../utils/range';

const ruleEngine = new RuleEngine(allRules);

export type ValidationService = vscode.Disposable & {
  readonly errorSummaryProvider: A11yErrorsTreeDataProvider;
  readonly treeView: vscode.TreeView<A11yTreeItem>;
  start(): void;
  validateDocument(document: vscode.TextDocument): void;
  clearDocument(document: vscode.TextDocument): void;
};

/**
 * Encapsula a validacao em tempo real, o painel lateral e a colecao de diagnosticos.
 */
export function createValidationService(context: vscode.ExtensionContext): ValidationService {
  let timeout: NodeJS.Timeout | undefined;
  const diagnosticsCollection = vscode.languages.createDiagnosticCollection('a11y-vsc-assistant');
  const errorSummaryProvider = new A11yErrorsTreeDataProvider(context.extensionUri);
  const treeView = vscode.window.createTreeView('a11yErrorSummary', {
    treeDataProvider: errorSummaryProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(diagnosticsCollection, treeView);

  function validateDocument(document: vscode.TextDocument): void {
    if (!isSupportedLanguage(document.languageId)) {
      return;
    }

    const errors: RuleError[] = ruleEngine.run(document.getText(), {
      languageId: document.languageId,
      uri: document.uri.toString(),
      fileName: document.fileName,
    });

    const diagnostics = mapRuleErrorsToDiagnostics(document, errors);
    diagnosticsCollection.set(document.uri, diagnostics);
    errorSummaryProvider.setErrors(document, errors);
    updateErrorSummaryBadge();

    errors.forEach(error => {
      const startPosition = document.positionAt(error.index);
      console.log(`[Linha ${startPosition.line + 1}] ${error.message}`);
    });
  }

  function clearDocument(document: vscode.TextDocument): void {
    diagnosticsCollection.delete(document.uri);
    errorSummaryProvider.removeErrorsForDocument(document);
    updateErrorSummaryBadge();
  }

  function validateActiveDocument(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    if (isSupportedLanguage(document.languageId)) {
      validateDocument(document);
    } else {
      clearDocument(document);
    }
  }

  function start(): void {
    updateErrorSummaryBadge();
    validateActiveDocument();
    void scanWorkspaceAndValidateAll();

    const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
      const document = event.document;

      if (isSupportedLanguage(document.languageId)) {
        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          validateDocument(document);
        }, 500);
      } else {
        clearDocument(document);
      }
    });

    const activeEditorChangeEvent = vscode.window.onDidChangeActiveTextEditor(editor => {
      if (!editor) {
        return;
      }

      const document = editor.document;
      if (isSupportedLanguage(document.languageId)) {
        validateDocument(document);
      } else {
        clearDocument(document);
      }
    });

    context.subscriptions.push(documentChangeEvent, activeEditorChangeEvent);
  }

  async function scanWorkspaceAndValidateAll(): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    try {
      const htmlFiles = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
      const cssFiles = await vscode.workspace.findFiles('**/*.css', '**/node_modules/**');
      const uris = [...htmlFiles, ...cssFiles];

      const concurrency = 20;
      for (let i = 0; i < uris.length; i += concurrency) {
        const batch = uris.slice(i, i + concurrency);
        await Promise.all(batch.map(async uri => {
          try {
            const document = await vscode.workspace.openTextDocument(uri);
            if (isSupportedLanguage(document.languageId)) {
              validateDocument(document);
            }
          } catch (err) {
            console.error('Erro ao abrir documento para validacao', uri.toString(), err);
          }
        }));
      }
    } catch (err) {
      console.error('Erro ao varrer workspace para arquivos HTML/CSS', err);
    }
  }

  function updateErrorSummaryBadge(): void {
    const totalErrors = errorSummaryProvider.getTotalErrors();
    treeView.description = `Total: ${totalErrors}`;

    if (totalErrors <= 0) {
      treeView.badge = undefined;
      treeView.message = 'Sem erros de acessibilidade no workspace.';
      return;
    }

    treeView.badge = {
      value: totalErrors,
      tooltip: `${totalErrors} erro(s) de acessibilidade no workspace`,
    };
    treeView.message = undefined;
  }

  function mapRuleErrorsToDiagnostics(document: vscode.TextDocument, errors: RuleError[]): vscode.Diagnostic[] {
    return errors.map(error => {
      const range = createSafeRange(document, error.index, error.tagLength ?? error.tag?.length ?? 0);
      const diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Warning);
      diagnostic.source = 'A11y Assistant';

      if (error.wcagReferenceKey) {
        const reference = getWcagReference(error.wcagReferenceKey);
        diagnostic.code = {
          value: `WCAG ${reference.criterion} - ${reference.title}`,
          target: vscode.Uri.parse(reference.url),
        };
      }

      return diagnostic;
    });
  }

  function isSupportedLanguage(languageId: string): languageId is RuleLanguage {
    return languageId === 'html' || languageId === 'css';
  }

  return {
    errorSummaryProvider,
    treeView,
    start,
    validateDocument,
    clearDocument,
    dispose() {
      if (timeout) {
        clearTimeout(timeout);
      }

      diagnosticsCollection.clear();
    },
  };
}