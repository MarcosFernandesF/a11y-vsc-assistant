import { RuleError } from "./types";
import { parseHtmlAttributes } from "./utils/htmlAttributes";
import { zoomMaximumScaleMessage, zoomUserScalableMessage } from "./educationMessages";

// Localiza rapidamente cada tag <meta ...> no HTML para filtrar apenas
// as meta viewport, sem depender de parser DOM no contexto da extensao.
const META_TAG_REGEX = /<meta\b[^>]*>/gi;

/**
 * Le o atributo content da viewport e extrai as diretivas declaradas.
 */
function parseViewportContent(content: string): Record<string, string> {
  const directives: Record<string, string> = {};
  const parts = content.split(/[,;]/);

  for (const part of parts) {
    const [rawKey, ...rawValueParts] = part.split("=");
    const key = (rawKey ?? "").trim().toLowerCase();
    const value = rawValueParts.join("=").trim().toLowerCase();

    if (!key || value === "") {
      continue;
    }

    directives[key] = value;
  }

  return directives;
}

/**
 * Determina se o valor de maximum-scale bloqueia zoom ate 200%.
 */
function isMaximumScaleBlocking(rawValue: string): boolean {
  if (rawValue === "yes") {
    return true;
  }

  const numeric = Number(rawValue);
  if (Number.isNaN(numeric)) {
    return false;
  }

  if (numeric <= 0) {
    return false;
  }

  return numeric < 2;
}

/**
 * Valida se a tag <meta name="viewport"> não restringe de nenhuma forma o zoom do usuario.
 * @param text O conteúdo HTML a ser analisado.
 */
export function validateZoomCapability(text: string): RuleError[] {
  const errors: RuleError[] = [];

  // Regex global reutilizada precisa ser reiniciada a cada validacao.
  META_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = META_TAG_REGEX.exec(text)) !== null) {
    const entireTag = match[0];
    const attrs = parseHtmlAttributes(entireTag);
    const name = attrs["name"]?.toLowerCase();

    if (name !== "viewport") {
      continue;
    }

    if (!("content" in attrs)) {
      continue;
    }

    const directives = parseViewportContent(attrs["content"]);

    const hasUserScalableNo = directives["user-scalable"] === "no";
    const hasMaximumScaleBlocking = directives["maximum-scale"] ?
      isMaximumScaleBlocking(directives["maximum-scale"]) :
      false;

    if (!hasUserScalableNo && !hasMaximumScaleBlocking) {
      continue;
    }

    if (hasUserScalableNo) {
      errors.push({
        tag: entireTag,
        index: match.index,
        message: zoomUserScalableMessage,
      });
    }

    if (hasMaximumScaleBlocking) {
      errors.push({
        tag: entireTag,
        index: match.index,
        message: zoomMaximumScaleMessage(directives["maximum-scale"]),
      });
    }
  }

  return errors;
}