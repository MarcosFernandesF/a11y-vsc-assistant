# Kit de validação de usuários

Este material faz parte da fase de validação do TCC e foi preparado para um estudo de usabilidade com desenvolvedores.

O objetivo é observar como os participantes interagem com a extensão de acessibilidade, como identificam problemas no código e de que forma corrigem as violações encontradas em HTML e CSS.

## Funcionalidades da ferramenta

- Analisa HTML e CSS em busca de violações de acessibilidade.
- Mostra os achados na barra lateral para orientar a revisão.
- Permite exportar um relatório mais detalhado quando for preciso revisar o panorama geral.
- Ajuda a acompanhar o andamento das correções durante a atividade.

## Contexto da atividade

O kit inclui uma base de interface com aparência próxima de um front real, contendo blocos de conteúdo, cards, depoimentos e uma seção de perguntas frequentes.

A página foi construída com alguns problemas de acessibilidade propositalmente inseridos para que o participante possa usá-la como cenário de teste da ferramenta.
Como a ferramenta é um protótipo inicial, o escopo de validação é reduzido; por isso, a leitura manual inicial ajuda a contextualizar os achados antes da comparação com a extensão.

## Escopo

O estudo foi desenhado para um fluxo curto e objetivo.

Como este é um protótipo inicial, o escopo de validação é reduzido.

A ideia não é refazer toda a interface, mas fazer correções pontuais e pequenas implementações guiadas, usando apenas HTML e CSS.

## Materiais incluídos

- `examples/kit-validacao-usuarios.html`
- `examples/kit-validacao-usuarios.css`

## Roteiro sugerido

1. Leitura do briefing e análise manual da página, da estilização e do código.
2. Instalação da extensão e comparação dos achados com a lista inicial.
3. Correção guiada: ir corrigindo os erros com apoio do hover, da barra lateral e do relatório exportado.
4. Questionário curto ao final.
5. SUS em formulário separado, reservado para a etapa final do estudo.

## Etapas da validação

### 1. Análise manual

Analise a página, a estilização e o código como um todo, sem ajuda de ferramenta externa. Anote manualmente os problemas de acessibilidade que você perceber com base no seu conhecimento.

### 2. Comparação com a ferramenta

Instale a extensão, compare os achados com a sua lista inicial e, se necessário, exporte o relatório para enxergar o panorama geral.

### 3. Correção guiada

Vá corrigindo os erros com apoio do feedback exibido no hover, da barra lateral e do relatório exportado para entender melhor cada achado.

### 4. Revisão final

Antes de concluir, veja se não ficou nenhum item na tela e se a página continua clara em desktop e mobile.

## Tarefas

1. Fazer uma leitura manual e anotar os problemas percebidos sem usar a extensão.
2. Abrir a extensão e comparar os achados com a lista inicial.
3. Corrigir os pontos encontrados com apoio da barra lateral e do relatório exportado.
4. Fazer uma revisão final e registrar o que a ferramenta agilizou ou esclareceu.

## Questionário rápido pós-tarefa

1. Qual é o seu nível de experiência como desenvolvedor(a)?
	- Estagiário
	- Junior
	- Pleno
    - Senior
2. Qual era o seu contato prévio com acessibilidade web?
	- Nenhum
	- Básico
	- Já usei em projetos
3. Você já conhecia as regras cobertas pela ferramenta?
	- Não
	- Sim, conhecia algumas.
	- Sim, conhecia a maioria.
4. A ferramenta agilizou o fluxo de correção?
	- Não
	- Sim, um pouco.
	- Sim, bastante.
5. A ferramenta ajudou a entender os erros de forma didática?
	- Não
	- Sim, um pouco. Quais?
	- Sim, bastante. Quais?
6. Tem alguma sugestão de melhoria para a ferramente?
	- Não
	- Sim. Qual?

## Observações finais

- O SUS será aplicado em um formulário separado.
- Se necessário, registre comentários livres ao final do questionário.
- O foco da atividade é avaliar a percepção do participante durante o uso da extensão e não medir desempenho em programação.