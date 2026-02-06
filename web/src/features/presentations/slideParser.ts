/**
 * Lightweight markdown slide parser
 * Parses Marp-style markdown (--- separated slides) into HTML
 * No external dependencies - keeps bundle small
 * Supports custom components via <!-- component: {...} --> syntax
 */

export interface ComponentData {
  type: string;
  props: Record<string, unknown>;
}

export interface Slide {
  html: string;
  components?: ComponentData[];
}

/**
 * Parse markdown slides separated by ---
 */
export function parseSlides(markdown: string): Slide[] {
  // Remove frontmatter (between first --- and second ---)
  const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---\n/, '');

  // Split by slide separator
  const rawSlides = withoutFrontmatter
    .split(/\n---\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return rawSlides.map(content => {
    const { html, components } = parseSlideContent(content);
    return { html, components };
  });
}

/**
 * Parse a single slide's content, extracting components
 */
function parseSlideContent(content: string): { html: string; components: ComponentData[] } {
  const components: ComponentData[] = [];

  // Extract component declarations: <!-- component:type {"prop": "value"} -->
  const componentPattern = /<!--\s*component:(\w+)\s+(\{[^}]+\})\s*-->/g;
  let match;

  while ((match = componentPattern.exec(content)) !== null) {
    const type = match[1];
    try {
      const props = JSON.parse(match[2]);
      components.push({ type, props });
    } catch {
      console.warn('Failed to parse component props:', match[2]);
    }
  }

  // Replace component declarations with placeholders for rendering
  const htmlContent = content.replace(
    componentPattern,
    (_, type, propsStr) => `<div class="component-placeholder" data-component="${type}" data-props='${propsStr}'></div>`
  );

  return {
    html: renderMarkdown(htmlContent),
    components,
  };
}

/**
 * Minimal markdown to HTML renderer
 * Supports: headers, paragraphs, lists, code blocks, inline code, bold, italic, links, tables
 */
function renderMarkdown(md: string): string {
  let html = md;

  // Code blocks (must be first to protect content)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Tables
  html = html.replace(/\n(\|.+\|\n)+/g, (match) => {
    const rows = match.trim().split('\n');
    let table = '<table class="slide-table">';

    rows.forEach((row, i) => {
      // Skip separator row (|---|---|)
      if (row.match(/^\|[\s-:|]+\|$/)) return;

      const cells = row.split('|').filter(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      table += '<tr>';
      cells.forEach(cell => {
        table += `<${tag}>${cell.trim()}</${tag}>`;
      });
      table += '</tr>';
    });

    table += '</table>';
    return '\n' + table + '\n';
  });

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Inline code (after code blocks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // HTML comments (remove)
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // Paragraphs (lines not already wrapped)
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
