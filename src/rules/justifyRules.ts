import { RuleError } from "./types";
import { justifyTextMessage } from "./educationMessages";

/**
 * Valida se o CSS possui uso de text-align: justify.
 * @param text O conteúdo CSS a ser analisado.
 */
export function validateJustifiedCss(text: string): RuleError[] {
  const errors: RuleError[] = [];

  // Remove comentarios preservando tamanho para manter indices consistentes.
  const cssWithoutComments = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
  const justifyRegex = /text-align\s*:\s*justify\b/gi;

  let match: RegExpExecArray | null;
  while ((match = justifyRegex.exec(cssWithoutComments)) !== null) {
    errors.push({
      tag: match[0],
      index: match.index,
      message: justifyTextMessage,
    });
  }

  return errors;
}