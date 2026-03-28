import { RuleError } from "./types";
import { parseHtmlAttributes } from "./utils/htmlAttributes";

// Captura tags de abertura HTML para verificar repeticao de IDs no documento.
const OPENING_TAG_REGEX = /<([a-z][\w:-]*)\b[^>]*>/gi;

/**
 * Valida duplicidade de atributos id em elementos HTML.
 * @param text O conteudo HTML a ser analisado.
 */
export function validateDuplicateIds(text: string): RuleError[] {
  const errors: RuleError[] = [];
  const seenIds = new Set<string>();

  OPENING_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = OPENING_TAG_REGEX.exec(text)) !== null) {
    const entireTag = match[0];
    const attrs = parseHtmlAttributes(entireTag);
    const id = attrs["id"];

    if (!id) {
      continue;
    }

    if (seenIds.has(id)) {
      errors.push({
        tag: entireTag,
        index: match.index,
        message: `Erro de Acessibilidade: ID duplicado detectado (id=\"${id}\"). IDs devem ser unicos na pagina.`,
      });
      continue;
    }

    seenIds.add(id);
  }

  return errors;
}
