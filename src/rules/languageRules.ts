import { RuleError } from "./types";
import { parseHtmlAttributes } from "./utils/htmlAttributes";
import { missingPageLanguageMessage } from "./educationMessages";

// Captura a tag raiz <html ...> para validar o idioma padrão da pagina.
const HTML_ROOT_TAG_REGEX = /<html\b[^>]*>/i;

/**
 * Valida se a pagina HTML define o atributo lang na tag raiz.
 * @param text O conteudo HTML a ser analisado.
 */
export function validatePageLanguage(text: string): RuleError[] {
  const errors: RuleError[] = [];

  const rootMatch = HTML_ROOT_TAG_REGEX.exec(text);
  if (!rootMatch) {
    return errors;
  }

  const htmlTag = rootMatch[0];
  const attrs = parseHtmlAttributes(htmlTag);
  const lang = attrs["lang"]?.trim();

  if (!lang) {
    errors.push({
      tag: htmlTag,
      index: rootMatch.index,
      message: missingPageLanguageMessage,
    });
  }

  return errors;
}
