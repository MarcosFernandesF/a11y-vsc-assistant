# Kit de validação de usuários

Este material faz parte da fase de validação do TCC e foi preparado para um estudo de usabilidade com desenvolvedores.

O objetivo é observar como os participantes interagem com a extensão de acessibilidade, como identificam problemas no código e de que forma corrigem as violações encontradas em HTML e CSS.

## Funcionalidades da ferramenta

- Analisa HTML e CSS em busca de violações de acessibilidade.
- Mostra os achados na barra lateral para orientar a revisão.
- Permite exportar um relatório mais detalhado quando for preciso revisar o panorama geral.
- Ajuda a acompanhar o andamento das correções durante a atividade.

## Contexto da atividade

O kit inclui uma base de interface com aparência próxima de um front real, contendo blocos de conteúdo, cards, chamadas para ação e uma seção de perguntas frequentes.

A página foi construída com alguns problemas de acessibilidade propositalmente inseridos para que o participante possa usá-la como cenário de teste da ferramenta.

## Escopo

O estudo foi desenhado para um fluxo curto e objetivo.

A ideia não é refazer toda a interface, mas fazer correções pontuais e pequenas implementações guiadas, usando apenas HTML e CSS.

## Materiais incluídos

- `examples/kit-validacao-usuarios.html`
- `examples/kit-validacao-usuarios.css`

## Roteiro sugerido

1. Leitura rápida do briefing e abertura do projeto.
2. Correção dos pontos sinalizados pela extensão.
3. Implementações guiadas nas seções da página.
4. Questionário curto ao final.
5. SUS em formulário separado, reservado para a etapa final do estudo.

## Como implementar

### 1. Guiar a correção com a extensão

Comece pelos avisos mais evidentes. Use a barra lateral para acompanhar os achados e, se necessário, exporte um relatório mais detalhado para conferir o panorama geral antes de seguir.

### 2. Criar as novas seções com estrutura mínima

Adicione a seção de depoimentos e a FAQ com a menor estrutura útil possível. O participante pode deixar a própria ferramenta indicar os ajustes restantes.

### 3. Revisão final

Antes de concluir, veja se não ficou nenhum item na tela e se a página continua clara em desktop e mobile.

## Tarefas

1. Corrigir as violações já existentes no código.
2. Adicionar uma seção de depoimentos com estrutura mínima.
3. Inserir uma FAQ curta com estrutura mínima.

## Questionário rápido pós-tarefa

1. Qual é o seu nível de experiência como desenvolvedor(a)?
	- Iniciante
	- Intermediário
	- Avançado
2. Qual era o seu contato prévio com acessibilidade web?
	- Nenhum
	- Básico
	- Já usei em projetos
3. Você já conhecia as regras cobertas pela ferramenta?
	- Sim, conhecia a maioria.
	- Sim, conhecia algumas.
	- Não
4. A ferramenta ajudou a identificar os problemas com mais rapidez?
	- Sim, bastante.
	- Sim, um pouco.
	- Não
	- Não percebi diferença.
5. Você aprendeu algo novo ou achou o material didático?
	- Sim, aprendi algo novo. Quais?
	- Não
6. Que melhoria você faria na ferramenta ou neste kit?
	- Sim, faria uma melhoria. Qual?
	- Não

## Observações finais

- O SUS será aplicado em um formulário separado.
- Se necessário, registre comentários livres ao final do questionário.
- O foco da atividade é avaliar a percepção do participante durante o uso da extensão e não medir desempenho em programação.