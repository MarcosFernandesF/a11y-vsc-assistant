import { RuleError } from "./types";
import { parseHtmlAttributes } from "./utils/htmlAttributes";

// Captura tags de abertura HTML e extrai o nome da tag no grupo 1.
const OPENING_TAG_REGEX = /<([a-z][\w:-]*)\b[^>]*>/gi;

// Identifica apenas listener de clique nativo de HTML (onclick).
const CLICK_LISTENER_REGEX = /\bonclick\s*=/i;

/**
 * Verifica se a tag e nativamente interativa para acao de clique/teclado.
 */
function isNativelyInteractive(tagName: string, attrs: Record<string, string>): boolean {
  const normalizedTag = tagName.toLowerCase();

  if (normalizedTag === "button" || normalizedTag === "select" || normalizedTag === "textarea") {
    return true;
  }

  if (normalizedTag === "input") {
    return attrs["type"]?.toLowerCase() !== "hidden";
  }

  if (normalizedTag === "a") {
    return typeof attrs["href"] === "string" && attrs["href"].trim() !== "";
  }

  return false;
}

/**
 * Valida elementos nao interativos com onclick sem role/tabindex.
 * @param text O conteudo HTML a ser analisado.
 */
export function validateNonInteractiveClickableElements(text: string): RuleError[] {
  const errors: RuleError[] = [];

  OPENING_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = OPENING_TAG_REGEX.exec(text)) !== null) {
    const entireTag = match[0];
    const tagName = match[1].toLowerCase();

    if (!CLICK_LISTENER_REGEX.test(entireTag)) {
      continue;
    }

    const attrs = parseHtmlAttributes(entireTag);

    if (isNativelyInteractive(tagName, attrs)) {
      continue;
    }

    const hasRole = typeof attrs["role"] === "string" && attrs["role"].trim() !== "";
    const hasTabindex = typeof attrs["tabindex"] === "string" && attrs["tabindex"].trim() !== "";

    if (hasRole || hasTabindex) {
      continue;
    }

    errors.push({
      tag: entireTag,
      index: match.index,
      message: "Erro de Acessibilidade: Elemento nao interativo com clique deve ter role e/ou tabindex para acesso por teclado.",
    });
  }

  return errors;
}
