import { RuleError } from "./types";
import { parseHtmlAttributes } from "./utils/htmlAttributes";
import { focusVisualRemovalHtmlMessage } from "./educationMessages";

// Captura tags de abertura HTML e o nome da tag no grupo 1.
const OPENING_TAG_REGEX = /<([a-z][\w:-]*)\b[^>]*>/gi;

// Detecta remocao de foco no style inline (outline: none ou outline: 0/0px).
const OUTLINE_REMOVAL_REGEX = /\boutline\s*:\s*(none|0(?:px)?)(?![\w-])/i;

// Detecta outline inline com valor visivel (diferente de none/0).
const VISIBLE_OUTLINE_REGEX = /\boutline\s*:\s*(?!\s*(none\b|0(?:px)?\b))[^;}{]+/i;

// Detecta box-shadow inline como alternativa de foco (exceto none).
const VISIBLE_BOX_SHADOW_REGEX = /\bbox-shadow\s*:\s*(?!\s*none\b)[^;}{]+/i;

// Detecta border inline com valor visivel no shorthand (exceto none/0).
const VISIBLE_BORDER_REGEX = /\bborder\s*:\s*(?!\s*(none\b|0(?:px)?\b))[^;}{]+/i;

// Detecta declaracoes border-color/style/width no style inline.
const VISIBLE_BORDER_PART_REGEX = /\bborder-(color|style|width)\s*:\s*[^;}{]+/i;

// Detecta text-decoration inline visivel (diferente de none).
const VISIBLE_TEXT_DECORATION_REGEX = /\btext-decoration\s*:\s*(?!\s*none\b)[^;}{]+/i;

/**
 * Verifica se existe indicador visual alternativo no style inline.
 */
function hasAlternativeFocusIndicator(style: string): boolean {
  return (
    VISIBLE_OUTLINE_REGEX.test(style) ||
    VISIBLE_BOX_SHADOW_REGEX.test(style) ||
    VISIBLE_BORDER_REGEX.test(style) ||
    VISIBLE_BORDER_PART_REGEX.test(style) ||
    VISIBLE_TEXT_DECORATION_REGEX.test(style)
  );
}

/**
 * Verifica se um elemento participa da navegacao sequencial por teclado.
 */
function isSequentiallyFocusable(tagName: string, attrs: Record<string, string>): boolean {
  const tabindexRaw = attrs["tabindex"];

  if (typeof tabindexRaw === "string") {
    const parsedTabindex = Number.parseInt(tabindexRaw, 10);

    if (!Number.isNaN(parsedTabindex)) {
      return parsedTabindex >= 0;
    }
  }

  const normalizedTagName = tagName.toLowerCase();

  if (normalizedTagName === "a") {
    return typeof attrs["href"] === "string" && attrs["href"].trim() !== "";
  }

  if (normalizedTagName === "button" || normalizedTagName === "select" || normalizedTagName === "textarea") {
    return true;
  }

  if (normalizedTagName === "input") {
    return attrs["type"]?.toLowerCase() !== "hidden";
  }

  return false;
}

/**
 * Valida elementos focaveis em HTML com remocao de foco visual inline sem alternativa.
 * @param text O conteudo HTML a ser analisado.
 */
export function validateHtmlFocusVisible(text: string): RuleError[] {
  const errors: RuleError[] = [];

  OPENING_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = OPENING_TAG_REGEX.exec(text)) !== null) {
    const entireTag = match[0];
    const tagName = match[1].toLowerCase();
    const attrs = parseHtmlAttributes(entireTag);

    if (!isSequentiallyFocusable(tagName, attrs)) {
      continue;
    }

    const style = attrs["style"];
    if (!style) {
      continue;
    }

    if (!OUTLINE_REMOVAL_REGEX.test(style)) {
      continue;
    }

    if (hasAlternativeFocusIndicator(style)) {
      continue;
    }

    errors.push({
      tag: entireTag,
      index: match.index,
      message: focusVisualRemovalHtmlMessage,
      wcagReferenceKey: "focusVisualRemovalHtml",
    });
  }

  return errors;
}
