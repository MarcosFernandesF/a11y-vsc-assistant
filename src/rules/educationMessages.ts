function buildEducationalMessage(problem: string, impact: string, fix: string): string {
  return [
    "[Problema detectado]",
    `- ${problem}`,
    "",
    "[Por que isso importa]",
    `- ${impact}`,
    "",
    "[Como corrigir]",
    `- ${fix}`,
  ].join("\n");
}

export function duplicateIdMessage(id: string): string {
  return buildEducationalMessage(
    `ID duplicado detectado (id="${id}"). IDs devem ser únicos na página.`,
    "Tecnologias assistivas e scripts podem associar rótulos e referências ao elemento errado, gerando navegação confusa.",
    "Garanta que cada valor de id apareça uma única vez e atualize referências como for/id e aria-labelledby."
  );
}

export const focusVisualRemovalCssMessage = buildEducationalMessage(
  "Remoção de foco visual detectada (outline: none/0) sem indicador alternativo visível.",
  "Pessoas que navegam por teclado podem perder a localização do foco e ficar sem conseguir continuar a interação.",
  "Mantenha o outline padrão ou forneça um indicador equivalente visível (ex.: outline, border, box-shadow ou text-decoration)."
);

export const focusVisualRemovalHtmlMessage = buildEducationalMessage(
  "Elemento focável remove o foco visual inline (outline: none/0) sem indicador alternativo.",
  "Sem pista visual de foco, usuários de teclado e baixa visão não conseguem identificar o elemento ativo.",
  "Remova a regra de supressão do outline ou adicione um estilo de foco claramente perceptível no próprio elemento."
);

export function headersHierarchySkipMessage(headerTag: string): string {
  return buildEducationalMessage(
    `Pulo de hierarquia detectado (${headerTag}).`,
    "Leitores de tela usam a estrutura de títulos para navegação rápida; pular níveis dificulta entendimento e orientação.",
    "Use níveis de cabeçalho em sequência lógica (h1 > h2 > h3...) conforme a estrutura do conteúdo."
  );
}

export function headersMultipleH1Message(headerTag: string): string {
  return buildEducationalMessage(
    `Múltiplos h1 detectados na página (${headerTag}).`,
    "Títulos principais concorrentes podem prejudicar a compreensão da hierarquia e do tópico central da página.",
    "Defina um h1 principal para o contexto da página e distribua seções subsequentes com h2-h6."
  );
}

export function headersDecreasingOrderMessage(headerTag: string): string {
  return buildEducationalMessage(
    `Hierarquia de headers fora de ordem crescente (${headerTag}).`,
    "Mudanças abruptas na estrutura de títulos atrapalham a navegação semântica e a previsibilidade para usuários de leitor de tela.",
    "Reorganize os títulos para refletir a relação entre seções, evitando regressão de nível sem novo contexto estrutural."
  );
}

export const imageAltMessage = buildEducationalMessage(
  "A tag <img> não possui atributo alt descritivo.",
  "Sem texto alternativo, quem usa leitor de tela perde informações essenciais transmitidas pela imagem.",
  "Adicione alt com descrição funcional da imagem; se for decorativa, use alt vazio (alt=\"\")."
);

export const justifyTextMessage = buildEducationalMessage(
  "Uso de text-align: justify detectado.",
  "Texto justificado pode criar espaços irregulares entre palavras, reduzindo legibilidade para pessoas com dislexia e baixa visão.",
  "Prefira alinhamento à esquerda em blocos longos de texto para manter ritmo visual mais previsível."
);

export const missingPageLanguageMessage = buildEducationalMessage(
  "A tag <html> não define o atributo lang com o idioma da página.",
  "Leitores de tela podem usar pronúncia incorreta quando o idioma principal não é declarado.",
  "Defina lang na raiz do documento com código BCP 47, por exemplo: <html lang=\"pt-BR\">."
);

export const nonInteractiveClickableMessage = buildEducationalMessage(
  "Elemento não interativo com onclick sem semântica de interação por teclado.",
  "Usuários que não usam mouse podem não conseguir acionar o controle, criando barreira funcional.",
  "Use elementos nativos interativos (ex.: <button>) ou adicione role apropriada e suporte completo a teclado."
);

export const zoomUserScalableMessage = buildEducationalMessage(
  "A meta viewport bloqueia zoom do usuário (user-scalable=no).",
  "Pessoas com baixa visão podem ficar impedidas de ampliar o conteúdo para leitura confortável.",
  "Remova user-scalable=no e permita que o navegador controle o zoom conforme necessidade da pessoa usuária."
);

export function zoomMaximumScaleMessage(maximumScale: string): string {
  return buildEducationalMessage(
    `A meta viewport restringe o zoom (maximum-scale=${maximumScale}).`,
    "Limitar ampliação abaixo de 200% pode impedir leitura e interação para pessoas com baixa visão.",
    "Remova maximum-scale ou configure valor que permita pelo menos 200% de zoom."
  );
}