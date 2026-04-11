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
 * Encontra o índice de um atributo específico dentro da tag inteira.
 */
function getAttributeIndexInTag(tag: string, attributeName: string): { index: number; length: number } | null {
  const regex = new RegExp(`\\b${attributeName}\\s*=\\s*["\']?[^"\'\\s>]+["\']?`, "i");
  const match = regex.exec(tag);
  return match ? { index: match.index, length: match[0].length } : null;
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
      const userScalableAttr = getAttributeIndexInTag(entireTag, "user-scalable");
      if (userScalableAttr) {
        errors.push({
          tag: entireTag,
          index: match.index + userScalableAttr.index,
          message: zoomUserScalableMessage,
          wcagReferenceKey: "zoomCapability",
          tagLength: userScalableAttr.length,
        });
      }
    }

    if (hasMaximumScaleBlocking) {
      const maximumScaleAttr = getAttributeIndexInTag(entireTag, "maximum-scale");
      if (maximumScaleAttr) {
        errors.push({
          tag: entireTag,
          index: match.index + maximumScaleAttr.index,
          message: zoomMaximumScaleMessage(directives["maximum-scale"]),
          wcagReferenceKey: "zoomCapability",
          tagLength: maximumScaleAttr.length,
        });
      }
    }
  }

  return errors;
}