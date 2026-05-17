/**
 * Indica se a linguagem do documento e suportada pela analise de acessibilidade.
 */
export function isSupportedLanguage(languageId: string): languageId is 'html' | 'css' {
	return languageId === 'html' || languageId === 'css';
}