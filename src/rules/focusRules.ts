import { RuleError } from "./types";

// Divide o CSS em blocos "seletor { declaracoes }" para avaliacao por contexto.
const CSS_BLOCK_REGEX = /([^{}]+)\{([^}]*)\}/g;

// Detecta remocao explicita do indicador padrao de foco (outline: none ou outline: 0/0px).
const OUTLINE_REMOVAL_REGEX = /\boutline\s*:\s*(none|0(?:px)?)(?![\w-])/gi;

// Detecta outline com valor visivel (qualquer valor diferente de none/0).
const VISIBLE_OUTLINE_REGEX = /\boutline\s*:\s*(?!\s*(none\b|0(?:px)?\b))[^;}{]+/i;

// Detecta box-shadow visivel como alternativa de foco (exceto none).
const VISIBLE_BOX_SHADOW_REGEX = /\bbox-shadow\s*:\s*(?!\s*none\b)[^;}{]+/i;

// Detecta borda visivel no shorthand border (exceto none/0).
const VISIBLE_BORDER_REGEX = /\bborder\s*:\s*(?!\s*(none\b|0(?:px)?\b))[^;}{]+/i;

// Detecta ajustes de border-color/style/width que podem criar indicador visual.
const VISIBLE_BORDER_PART_REGEX = /\bborder-(color|style|width)\s*:\s*[^;}{]+/i;

// Detecta text-decoration visivel (substitui o indicador quando nao e none).
const VISIBLE_TEXT_DECORATION_REGEX = /\btext-decoration\s*:\s*(?!\s*none\b)[^;}{]+/i;

/**
 * Verifica se existe indicador visual alternativo no mesmo bloco CSS.
 */
function hasAlternativeFocusIndicator(declarations: string): boolean {
  return (
    VISIBLE_OUTLINE_REGEX.test(declarations) ||
    VISIBLE_BOX_SHADOW_REGEX.test(declarations) ||
    VISIBLE_BORDER_REGEX.test(declarations) ||
    VISIBLE_BORDER_PART_REGEX.test(declarations) ||
    VISIBLE_TEXT_DECORATION_REGEX.test(declarations)
  );
}

/**
 * Valida remocao de foco visual em CSS sem alternativa de indicador visivel.
 * @param text O conteudo CSS a ser analisado.
 */
export function validateFocusVisualRemoval(text: string): RuleError[] {
  const errors: RuleError[] = [];

  // Remove comentarios preservando tamanho para manter indices consistentes.
  const cssWithoutComments = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));

  CSS_BLOCK_REGEX.lastIndex = 0;

  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = CSS_BLOCK_REGEX.exec(cssWithoutComments)) !== null) {
    const selector = blockMatch[1].trim();
    const declarations = blockMatch[2];
    const blockStartIndex = blockMatch.index;
    const declarationsStartIndex = blockStartIndex + blockMatch[0].indexOf("{") + 1;

    OUTLINE_REMOVAL_REGEX.lastIndex = 0;
    const hasAlternativeIndicator = hasAlternativeFocusIndicator(declarations);

    if (hasAlternativeIndicator) {
      continue;
    }

    let outlineMatch: RegExpExecArray | null;
    while ((outlineMatch = OUTLINE_REMOVAL_REGEX.exec(declarations)) !== null) {
      errors.push({
        tag: outlineMatch[0],
        index: declarationsStartIndex + outlineMatch.index,
        message: "Erro de Acessibilidade: Evite remover o foco visual (outline: none/0) sem indicador alternativo visivel.",
      });
    }
  }

  return errors;
}
