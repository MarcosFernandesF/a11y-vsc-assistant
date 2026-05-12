import { WcagReferenceKey } from "./wcagReferences";

export type RuleLanguage = "html" | "css";

export type RuleContext = {
  languageId: RuleLanguage;
  uri?: string;
  fileName?: string;
};

/**
 * Interface que representa o contrato de um erro de acessibilidade.
 * Utilizada para padronizar o retorno de todas as funções de validação.
 */
export interface RuleError {
  tag: string;
  index: number;
  message: string;
  wcagReferenceKey?: WcagReferenceKey;
  tagLength?: number;
  ruleId?: string;
}

export interface A11yRule {
  id: string;
  languages: RuleLanguage[];
  evaluate(text: string, context: RuleContext): RuleError[];
}