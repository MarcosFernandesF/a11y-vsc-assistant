/**
 * Interface que representa o contrato de um erro de acessibilidade.
 * Utilizada para padronizar o retorno de todas as funções de validação.
 */
export interface RuleError {
  tag: string;
  index: number;
  message: string;
}

/**
 * Interface genérica para casos de teste de regras de validação.
 */
export interface TestCase<T = string> {
  name: string;
  html: string;
  expected: T;
}