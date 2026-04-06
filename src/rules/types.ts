import { WcagReferenceKey } from "./wcagReferences";

/**
 * Interface que representa o contrato de um erro de acessibilidade.
 * Utilizada para padronizar o retorno de todas as funções de validação.
 */
export interface RuleError {
  tag: string;
  index: number;
  message: string;
  wcagReferenceKey?: WcagReferenceKey;
}