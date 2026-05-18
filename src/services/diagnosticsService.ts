import * as vscode from 'vscode';
import { RuleError } from '../rules/core/types';
import { getWcagReference } from '../rules/core/wcagReferences';
import { createSafeRange } from '../utils/range';

/**
 * Responsavel por transformar RuleError em Diagnostic e publicar no editor.
 */
export class DiagnosticsService implements vscode.Disposable {
  private readonly diagnosticsCollection = vscode.languages.createDiagnosticCollection('a11y-vsc-assistant');
  private disposed = false;

  setErrors(document: vscode.TextDocument, errors: RuleError[]): void {
    if (this.disposed) {
      return;
    }

    const diagnostics = errors.map(error => this.mapRuleErrorToDiagnostic(document, error));
    this.diagnosticsCollection.set(document.uri, diagnostics);
  }

  clearDocument(document: vscode.TextDocument): void {
    if (this.disposed) {
      return;
    }

    this.diagnosticsCollection.delete(document.uri);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.diagnosticsCollection.dispose();
  }

  private mapRuleErrorToDiagnostic(document: vscode.TextDocument, error: RuleError): vscode.Diagnostic {
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
  }
}
