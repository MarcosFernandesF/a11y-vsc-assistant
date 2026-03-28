// Regex compartilhada para extrair atributos HTML no formato nome=valor,
// aceitando aspas duplas, simples e valores sem aspas.
const HTML_ATTRIBUTE_REGEX = /\b([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

/**
 * Converte os atributos de uma tag HTML para mapa chave/valor.
 */
export function parseHtmlAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let attrMatch: RegExpExecArray | null;

  // Regex global reutilizada precisa ser reiniciada a cada parse.
  HTML_ATTRIBUTE_REGEX.lastIndex = 0;

  while ((attrMatch = HTML_ATTRIBUTE_REGEX.exec(tag)) !== null) {
    const name = attrMatch[1].toLowerCase();
    const value = (attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "").trim();
    attrs[name] = value;
  }

  return attrs;
}
