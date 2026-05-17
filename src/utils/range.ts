import * as vscode from 'vscode';

/**
 * Cria um range seguro a partir de um offset inicial e de um tamanho estimado.
 */
export function createSafeRange(
  document: vscode.TextDocument,
  startOffset: number,
  lengthHint = 0
): vscode.Range {
  const textLength = document.getText().length;
  const safeStart = Math.max(0, Math.min(startOffset, textLength));
  let safeEnd = Math.max(safeStart, Math.min(safeStart + Math.max(lengthHint, 1), textLength));

  if (safeEnd === safeStart && safeStart < textLength) {
    safeEnd = safeStart + 1;
  }

  return new vscode.Range(
    document.positionAt(safeStart),
    document.positionAt(safeEnd)
  );
}