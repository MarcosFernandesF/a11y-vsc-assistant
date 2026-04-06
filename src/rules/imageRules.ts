import { RuleError } from "./types";
import { imageAltMessage } from "./educationMessages";

/**
 * Valida se as tags <img> possuem um atributo 'alt' não vazio.
 * @param text O conteúdo HTML a ser analisado.
 */
export function validateImagesWithoutAlt(text: string): RuleError[] {
  const errors: RuleError[] = [];

  // Regex para capturar a tag <img> completa.
  const imgTagRegex = /<img[^>]*>/gi;

  // Regex robusta para validar o 'alt' com conteúdo, ignorando a ordem dos atributos.
  const validAltRegex = /<img\s+(?=[^>]*?\balt=["'](?!\s*["'])[^"']+?["'])[^>]*?>/i;

  let match;
  while ((match = imgTagRegex.exec(text)) !== null) {
    const entireTag = match[0];
    const hasValidAlt = validAltRegex.test(entireTag);

    if (!hasValidAlt) {
      errors.push({
        tag: entireTag,
        index: match.index,
        message: imageAltMessage
      });
    }
  }
  return errors;
}