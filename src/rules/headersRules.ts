import { RuleError } from "./types";
import {
  headersDecreasingOrderMessage,
  headersHierarchySkipMessage,
  headersMultipleH1Message,
} from "./educationMessages";

/**
 * Valida se os cabeçalhos estão em um ordem lógica (h1 a h6).
 * @param text O conteúdo HTML a ser análisado.
 */
export function validateHeadersOrder(text: string): RuleError[] {
  const errors: RuleError[] = [];

  // Identifica se possui headers -> <h seguido de um número de 1 a 6.
  const headerRegex = /<h([1-6])\b[^>]*>/gi;

  let match;
  const allHeaders:
    {
      text: string;
      headerLevel: number;
      index: number
    }[] = [];

  while ((match = headerRegex.exec(text)) !== null) {
    const headerTag = match[0];
    const headerLevel = Number(match[1]);
    allHeaders.push({
      text: headerTag,
      headerLevel,
      index: match.index,
    });
  }

  let previousLevel = 0;
  for (const header of allHeaders) {
    if (previousLevel !== 0 && header.headerLevel > previousLevel + 1) {
      errors.push({
        tag: header.text,
        index: header.index,
        message: headersHierarchySkipMessage(header.text),
      });
    }

    if (previousLevel === 1 && header.headerLevel === 1) {
      errors.push({
        tag: header.text,
        index: header.index,
        message: headersMultipleH1Message(header.text),
      });
    }

    if (previousLevel !== 0 && header.headerLevel < previousLevel) {
      errors.push({
        tag: header.text,
        index: header.index,
        message: headersDecreasingOrderMessage(header.text),
      });
    }

    previousLevel = header.headerLevel;
  }

  return errors;
}
