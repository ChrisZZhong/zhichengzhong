import type { Element, Root } from 'hast';

export interface DrawingInsertion {
  offset: number;
  indent: string;
}

const insertableBlocks = new Set(['p', 'pre', 'ol', 'ul', 'table', 'blockquote']);

export function markPreviewDrawingBlocks(source: string) {
  return (root: Root) => {
    function markBlocks(container: Root | Element, indent = '') {
      for (let index = container.children.length - 1; index >= 0; index--) {
        const node = container.children[index];
        if (node.type !== 'element') continue;

        if (node.tagName === 'details') {
          const body = node.children.find((child): child is Element =>
            child.type === 'element' && child.tagName === 'div' &&
            Array.isArray(child.properties.className) && child.properties.className.includes('solution-card-body'));
          if (body) markBlocks(body, indent);
        }
        if (!insertableBlocks.has(node.tagName) || node.position?.end.offset === undefined) continue;

        if (node.tagName === 'ol' || node.tagName === 'ul') {
          let markedInside = false;
          for (const item of node.children) {
            // Loose list items have their own paragraph blocks. Keep their figures
            // inside the item by using the original list marker's content indent.
            if (item.type !== 'element' || item.tagName !== 'li' || item.position?.start.offset === undefined ||
                !item.children.some(child => child.type === 'element' && child.tagName === 'p')) continue;
            const lineStart = source.lastIndexOf('\n', item.position.start.offset - 1) + 1;
            const marker = /^ *(?:[-+*]|\d{1,9}[.)]) {1,4}(?=\S)/.exec(source.slice(lineStart));
            if (!marker) continue;
            markBlocks(item, ' '.repeat(marker[0].length));
            markedInside = true;
          }
          if (markedInside) continue;
        }

        container.children.splice(index + 1, 0, {
          type: 'element',
          tagName: 'span',
          properties: {
            drawingMarkerOffset: node.position.end.offset,
            drawingMarkerIndent: indent,
          },
          children: [],
        });
      }
    }

    markBlocks(root);
  };
}
