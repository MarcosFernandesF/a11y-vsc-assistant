import * as vscode from 'vscode';
import { RuleEngine } from '../rules/core/engine';
import { allRules } from '../rules/core/registry';
import { RuleError } from '../rules/core/types';
import { A11yErrorsTreeDataProvider, A11yTreeItem } from '../providers/errorSummaryProvider';
import { DiagnosticsService } from './diagnosticsService';
import { isSupportedLanguage } from '../utils/language';

const ruleEngine = new RuleEngine(allRules);

/**
 * Orquestra a validacao em tempo real, o painel lateral e os diagnostics do editor.
 */
export class ValidationService implements vscode.Disposable {
  public readonly errorSummaryProvider: A11yErrorsTreeDataProvider;
  public readonly treeView: vscode.TreeView<A11yTreeItem>;

  private readonly context: vscode.ExtensionContext;
  private readonly diagnosticsService: DiagnosticsService;
  private timeout: NodeJS.Timeout | undefined;
  private disposed = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.diagnosticsService = new DiagnosticsService();
    this.errorSummaryProvider = new A11yErrorsTreeDataProvider(context.extensionUri);
    this.treeView = vscode.window.createTreeView('a11yErrorSummary', {
      treeDataProvider: this.errorSummaryProvider,
      showCollapseAll: false,
    });
  }

  start(): void {
    this.updateErrorSummaryBadge();
    this.validateActiveDocument();
    void this.scanWorkspaceAndValidateAll();

    const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
      const document = event.document;

      if (isSupportedLanguage(document.languageId)) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
          this.validateDocument(document);
        }, 500);
      } else {
        this.clearDocument(document);
      }
    });

    this.context.subscriptions.push(documentChangeEvent);
  }

  validateDocument(document: vscode.TextDocument): void {
    if (!isSupportedLanguage(document.languageId)) {
      return;
    }

    const errors: RuleError[] = ruleEngine.run(document.getText(), {
      languageId: document.languageId,
      uri: document.uri.toString(),
      fileName: document.fileName,
    });

    this.diagnosticsService.setErrors(document, errors);
    this.errorSummaryProvider.setErrors(document, errors);
    this.updateErrorSummaryBadge();

    errors.forEach(error => {
      const startPosition = document.positionAt(error.index);
      console.log(`[Linha ${startPosition.line + 1}] ${error.message}`);
    });
  }

  clearDocument(document: vscode.TextDocument): void {
    this.diagnosticsService.clearDocument(document);
    this.errorSummaryProvider.removeErrorsForDocument(document);
    this.updateErrorSummaryBadge();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.treeView.dispose();
    this.diagnosticsService.dispose();
  }

  private validateActiveDocument(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    if (isSupportedLanguage(document.languageId)) {
      this.validateDocument(document);
    } else {
      this.clearDocument(document);
    }
  }

  private async scanWorkspaceAndValidateAll(): Promise<void> {
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
              this.validateDocument(document);
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

  private updateErrorSummaryBadge(): void {
    const totalErrors = this.errorSummaryProvider.getTotalErrors();
    this.treeView.description = `Total: ${totalErrors}`;

    if (totalErrors <= 0) {
      this.treeView.badge = undefined;
      this.treeView.message = 'Sem erros de acessibilidade no workspace.';
      return;
    }

    this.treeView.badge = {
      value: totalErrors,
      tooltip: `${totalErrors} erro(s) de acessibilidade no workspace`,
    };
    this.treeView.message = undefined;
  }

}
