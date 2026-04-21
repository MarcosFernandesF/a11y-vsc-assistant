import type { A11yErrorExportItem, A11yReportPayload } from './exportReport';
import { getWcagReference } from './rules/wcagReferences';

/**
 * Gera o HTML completo do relatorio de acessibilidade.
 */
export function createA11yReportHtml(payload: A11yReportPayload): string {
  const groupedErrors = groupErrorsByCategory(payload.errors);
  const generatedAtText = formatDateTime(payload.generatedAt);
  const sourceFileText = escapeHtml(payload.sourceFile);
  const hasErrors = payload.totalErrors > 0;

  const categorySections = groupedErrors.length > 0
    ? groupedErrors.map(group => `
        <section class="category-card">
          <div class="category-header">
            <h2>${escapeHtml(group.category)}</h2>
            <span class="category-count">${group.errors.length} problema(s)</span>
          </div>
          <div class="error-list">
            ${group.errors.map(error => renderErrorCard(error)).join('\n')}
          </div>
        </section>
      `).join('\n')
    : `
        <section class="empty-state">
          <h2>Nenhum problema encontrado</h2>
          <p>O documento analisado nao apresentou problemas de acessibilidade nas regras suportadas.</p>
        </section>
      `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatorio de Acessibilidade</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #ece6dc;
      --bg-accent: #fff8ee;
      --surface: rgba(255, 255, 255, 0.98);
      --surface-strong: #ffffff;
      --text: #121826;
      --muted: #344054;
      --accent: #8a3b00;
      --accent-soft: rgba(138, 59, 0, 0.22);
      --border: rgba(18, 24, 38, 0.22);
      --good: #0f5132;
      --bad: #6f1028;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: var(--bg);
    }

    .page {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 48px;
    }

    .hero {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 32px;
      background: var(--surface-strong);
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .hero h1 {
      margin: 18px 0 12px;
      font-size: clamp(2rem, 4vw, 3.45rem);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    .hero p {
      max-width: 760px;
      margin: 0;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.65;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .metric {
      padding: 18px 20px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--surface);
    }

    .metric-label {
      display: block;
      color: var(--muted);
      font-size: 0.88rem;
      margin-bottom: 10px;
    }

    .metric-value {
      display: block;
      font-size: 1.08rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .metric-value.bad {
      color: var(--bad);
    }

    .metric-value.good {
      color: var(--good);
    }

    .section-list {
      display: grid;
      gap: 18px;
      margin-top: 22px;
    }

    .category-card,
    .empty-state {
      border: 1px solid rgba(18, 24, 38, 0.22);
      border-radius: 24px;
      padding: 24px;
      background: var(--surface-strong);
    }

    .category-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .category-header h2,
    .empty-state h2 {
      margin: 0;
      font-size: 1.2rem;
      letter-spacing: -0.02em;
    }

    .category-count {
      padding: 8px 12px;
      border-radius: 999px;
      background: var(--text);
      color: #ffffff;
      font-size: 0.88rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .error-list {
      display: grid;
      gap: 14px;
    }

    .error-card {
      border: 1px solid rgba(18, 24, 38, 0.2);
      border-left-width: 8px;
      border-radius: 18px;
      padding: 18px 20px;
      background: #ffffff;
    }

    .error-card-header {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .error-card h3 {
      margin: 0;
      font-size: 1.03rem;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .message-sections {
      display: grid;
      gap: 14px;
    }

    .message-section {
      padding: 14px 16px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid rgba(18, 24, 38, 0.18);
      border-left-width: 6px;
    }

    .message-section.problem {
      border-left-color: #7a3300;
      background: #f8e8df;
    }

    .message-section.impact {
      border-left-color: #0b5c56;
      background: #e1f0ed;
    }

    .message-section.fix {
      border-left-color: #0b4f75;
      background: #e1edf6;
    }

    .message-section.reference {
      border-left-color: #312e81;
      background: #e3e2f7;
    }

    .message-label {
      display: inline-flex;
      margin-bottom: 8px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--text);
      color: #ffffff;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .message-text {
      margin: 0;
      color: var(--text);
      line-height: 1.7;
      font-size: 0.98rem;
    }

    .code-snippet {
      margin-top: 12px;
      margin-bottom: 16px;
      border: 1px solid rgba(127, 29, 29, 0.22);
      border-radius: 14px;
      background: #fef2f2;
      color: #7f1d1d;
      overflow: auto;
    }

    .code-snippet-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(127, 29, 29, 0.16);
      background: #dc2626;
      color: #ffffff;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .code-snippet pre {
      margin: 0;
      padding: 14px;
      overflow: auto;
      font-size: 0.9rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .code-snippet code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      color: inherit;
    }

    .reference-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      color: #312e81;
      font-weight: 800;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .reference-link:hover,
    .reference-link:focus-visible {
      color: #1f1b6d;
    }

    .error-location {
      flex: 0 0 auto;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(138, 59, 0, 0.14);
      color: #6b2d00;
      font-weight: 700;
      font-size: 0.84rem;
    }

    .empty-state {
      text-align: center;
      padding: 40px 24px;
    }

    .empty-state p {
      margin: 10px auto 0;
      max-width: 640px;
      color: var(--muted);
      line-height: 1.65;
    }

    .footer {
      padding: 18px 2px 0;
      color: var(--muted);
      font-size: 0.88rem;
      text-align: center;
    }

    @media (max-width: 820px) {
      .page {
        width: min(100% - 20px, 1120px);
        padding-top: 18px;
      }

      .hero {
        padding: 22px;
        border-radius: 22px;
      }

      .meta-grid {
        grid-template-columns: 1fr;
      }

      .category-header,
      .error-card-header {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="eyebrow">A11y Assistant</span>
      <h1>Relatorio de acessibilidade</h1>
      <p>
        Relatorio gerado a partir da analise do arquivo ativo. O objetivo e destacar
        os problemas encontrados com uma leitura mais rapida e visualmente clara.
      </p>

      <div class="meta-grid">
        <article class="metric">
          <span class="metric-label">Problemas encontrados</span>
          <span class="metric-value ${hasErrors ? 'bad' : 'good'}">${payload.totalErrors}</span>
        </article>
        <article class="metric">
          <span class="metric-label">Arquivo analisado</span>
          <span class="metric-value">${sourceFileText}</span>
        </article>
        <article class="metric">
          <span class="metric-label">Gerado em</span>
          <span class="metric-value">${escapeHtml(generatedAtText)}</span>
        </article>
      </div>
    </section>

    <section class="section-list" aria-label="Detalhes dos problemas de acessibilidade">
      ${categorySections}
    </section>

    <div class="footer">
      Relatorio exportado pelo A11y VSCode Assistant.
    </div>
  </main>
</body>
</html>`;
}

/**
 * Agrupa os erros por categoria para montar as secoes do relatorio.
 */
function groupErrorsByCategory(errors: A11yErrorExportItem[]): Array<{ category: string; errors: A11yErrorExportItem[] }> {
  const grouped = new Map<string, A11yErrorExportItem[]>();

  for (const error of errors) {
    const categoryErrors = grouped.get(error.category) ?? [];
    categoryErrors.push(error);
    grouped.set(error.category, categoryErrors);
  }

  return Array.from(grouped.entries()).map(([category, categoryErrors]) => ({ category, errors: categoryErrors }));
}

/**
 * Renderiza o card visual de um erro individual com trecho de codigo e mensagens educativas.
 */
function renderErrorCard(error: A11yErrorExportItem): string {
  const messageParts = parseEducationalMessage(error.details);
  const codeSnippet = escapeHtml(error.codeSnippet);

  return `
    <article class="error-card">
      <div class="error-card-header">
        <h3>${escapeHtml(error.summary)}</h3>
        <span class="error-location">Linha ${error.line}, coluna ${error.column}</span>
      </div>
      <section class="code-snippet" aria-label="Trecho do código problemático">
        <div class="code-snippet-header">Trecho problemático</div>
        <pre><code>${codeSnippet}</code></pre>
      </section>
      <div class="message-sections">
        ${messageParts.map(section => renderMessageSection(section, error.wcagReferenceKey)).join('\n')}
      </div>
    </article>
  `;
}

/**
 * Interpreta a mensagem educativa estruturada e separa seus blocos para o HTML final.
 */
function parseEducationalMessage(message: string): Array<{ label: string; text?: string; kind: 'problem' | 'impact' | 'fix' | 'reference' }> {
  const labelOrder = [
    { label: '[Problema detectado]', kind: 'problem' as const },
    { label: '[Por que isso importa]', kind: 'impact' as const },
    { label: '[Como corrigir]', kind: 'fix' as const },
    { label: '[Fonte oficial WCAG 2.2]', kind: 'reference' as const },
  ];

  const lines = message.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const sections: Array<{ label: string; text?: string; kind: 'problem' | 'impact' | 'fix' | 'reference' }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const matchedLabel = labelOrder.find(section => section.label === current);

    if (!matchedLabel) {
      continue;
    }

    const nextLine = lines[index + 1];
    const nextText = nextLine?.startsWith('- ') ? nextLine.slice(2).trim() : undefined;

    sections.push({
      label: current,
      text: nextText,
      kind: matchedLabel.kind,
    });

    if (nextText) {
      index += 1;
    }
  }

  return sections.length > 0
    ? sections
    : [{ label: '[Detalhes]', text: message, kind: 'problem' }];
}

/**
 * Renderiza uma secao de mensagem do relatorio, escolhendo o layout correto por tipo.
 */
function renderMessageSection(
  section: { label: string; text?: string; kind: 'problem' | 'impact' | 'fix' | 'reference' },
  wcagReferenceKey?: A11yErrorExportItem['wcagReferenceKey']
): string {
  if (section.kind === 'reference') {
    return renderReferenceSection(section.label, wcagReferenceKey);
  }

  return `
    <section class="message-section ${section.kind}">
      <span class="message-label">${escapeHtml(section.label.replace(/[\[\]]/g, ''))}</span>
      <p class="message-text">${escapeHtml(section.text ?? '')}</p>
    </section>
  `;
}

/**
 * Renderiza a secao de referencia WCAG, com link oficial quando a chave existir.
 */
function renderReferenceSection(label: string, wcagReferenceKey?: A11yErrorExportItem['wcagReferenceKey']): string {
  if (!wcagReferenceKey) {
    return `
      <section class="message-section reference">
        <span class="message-label">${escapeHtml(label.replace(/[\[\]]/g, ''))}</span>
        <p class="message-text">WCAG 2.2</p>
      </section>
    `;
  }

  const reference = getWcagReference(wcagReferenceKey);

  if (!reference) {
    return `
      <section class="message-section reference">
        <span class="message-label">${escapeHtml(label.replace(/[\[\]]/g, ''))}</span>
        <p class="message-text">WCAG 2.2</p>
      </section>
    `;
  }

  return `
    <section class="message-section reference">
      <span class="message-label">${escapeHtml(label.replace(/[\[\]]/g, ''))}</span>
      <p class="message-text">
        <a class="reference-link" href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer noopener">
          WCAG ${escapeHtml(reference.criterion)} - ${escapeHtml(reference.title)}
        </a>
      </p>
    </section>
  `;
}

/**
 * Converte o timestamp ISO em texto legivel para o usuario final.
 */
function formatDateTime(isoValue: string): string {
  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return isoValue;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Escapa caracteres especiais para evitar que o conteudo do relatorio quebre o HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}