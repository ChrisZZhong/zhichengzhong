'use client';

import { useRef, useState } from 'react';

interface Props {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}

const tools = [
  { label: 'Heading', before: '\n\n### ', placeholder: 'Heading', after: '\n\n' },
  { label: 'Bold', before: '**', placeholder: 'text', after: '**' },
  { label: 'Italic', before: '*', placeholder: 'text', after: '*' },
  { label: 'List', before: '\n\n- ', placeholder: 'List item', after: '\n\n' },
  { label: 'Link', before: '[', placeholder: 'Link text', after: '](https://example.com)' },
  { label: 'Inline code', before: '\x60', placeholder: 'code', after: '\x60' },
  { label: 'Code block', before: '\n\n\x60\x60\x60text\n', placeholder: 'code', after: '\n\x60\x60\x60\n\n' },
];
const buttonClass = 'rounded-md border border-card-border bg-space px-2 py-1 text-xs hover:border-indigo-400 disabled:opacity-50';

export default function LocalMarkdownInput({ value, readOnly, onChange }: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const [formatError, setFormatError] = useState('');

  function insert({ before, placeholder, after }: typeof tools[number]) {
    const textarea = input.current;
    if (!textarea || readOnly) return;
    const { selectionStart: start, selectionEnd: end } = textarea;
    const selected = textarea.value.slice(start, end) || placeholder;
    textarea.focus();
    // Editing through the browser keeps toolbar changes in the textarea's undo history.
    if (!document.execCommand('insertText', false, before + selected + after)) {
      setFormatError('This browser could not apply the formatting shortcut.');
      return;
    }
    setFormatError('');
    onChange(textarea.value);
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function changeHistory(command: 'undo' | 'redo') {
    const textarea = input.current;
    if (!textarea || readOnly) return;
    textarea.focus();
    if (document.execCommand(command)) onChange(textarea.value);
  }

  return (
    <>
      <div role="toolbar" aria-label="Markdown formatting" className="mt-3 flex flex-wrap gap-1.5">
        {(['Undo', 'Redo'] as const).map(label => (
          <button
            type="button"
            key={label}
            onMouseDown={event => event.preventDefault()}
            onClick={() => changeHistory(label === 'Undo' ? 'undo' : 'redo')}
            disabled={readOnly}
            className={buttonClass}
          >
            {label}
          </button>
        ))}
        {tools.map(tool => (
          <button
            type="button"
            key={tool.label}
            onMouseDown={event => event.preventDefault()}
            onClick={() => insert(tool)}
            disabled={readOnly}
            className={buttonClass}
          >
            {tool.label}
          </button>
        ))}
      </div>
      {formatError && <p role="alert" className="mt-2 text-xs text-red-600">{formatError}</p>}
      <textarea
        ref={input}
        aria-label="Markdown"
        value={value}
        onChange={event => onChange(event.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        className="mt-3 min-h-[35rem] w-full resize-y rounded-lg border border-card-border bg-space p-3 font-mono text-sm leading-relaxed"
      />
    </>
  );
}
