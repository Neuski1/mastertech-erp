import React, { useRef } from 'react';

/**
 * Textarea that auto-prefixes each line with a bullet "• "
 * On Enter: adds new bullet line
 * On Backspace at start of empty bullet: removes the line
 * Stores plain text (no bullet chars) — bullets are display only
 */
export default function BulletTextarea({ value, onChange, placeholder, style }) {
  const ref = useRef(null);

  // Convert stored plain text to bullet display
  const toBullets = (text) => {
    if (!text) return '';
    return text.split('\n').map(line => line.startsWith('• ') ? line : '• ' + line).join('\n');
  };

  // Strip bullets for storage
  const fromBullets = (text) => {
    return text.split('\n').map(line => line.replace(/^• ?/, '')).join('\n');
  };

  const displayValue = toBullets(value || '');

  const handleChange = (e) => {
    const raw = e.target.value;
    // Ensure every line has a bullet
    const fixed = raw.split('\n').map(line => {
      if (line.startsWith('• ')) return line;
      if (line.startsWith('•')) return '• ' + line.slice(1);
      return '• ' + line;
    }).join('\n');

    onChange(fromBullets(fixed));
  };

  const handleKeyDown = (e) => {
    const ta = ref.current;
    if (!ta) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const pos = ta.selectionStart;
      const val = ta.value;
      const newVal = val.slice(0, pos) + '\n• ' + val.slice(pos);
      onChange(fromBullets(newVal));
      // Set cursor after the new bullet
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = pos + 3;
      }, 0);
    }

    if (e.key === 'Backspace') {
      const pos = ta.selectionStart;
      const val = ta.value;
      // If cursor is right after "• " on a line, and the line content is empty, delete the whole line
      const beforeCursor = val.slice(0, pos);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      if (currentLine === '• ' && lines.length > 1) {
        e.preventDefault();
        // Remove current empty bullet line
        const afterCursor = val.slice(pos);
        lines.pop();
        const newVal = lines.join('\n') + afterCursor;
        onChange(fromBullets(newVal));
        setTimeout(() => {
          const newPos = lines.join('\n').length;
          ta.selectionStart = ta.selectionEnd = newPos;
        }, 0);
      }
    }
  };

  return (
    <textarea
      ref={ref}
      value={displayValue || (placeholder ? '' : '• ')}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={(e) => {
        if (!e.target.value) {
          onChange('');
          // Will show "• " via toBullets on next render
        }
      }}
      placeholder={placeholder || '• Describe the work needed...'}
      style={style}
    />
  );
}

/**
 * Display-only bullet list for non-edit mode
 */
export function BulletDisplay({ text }) {
  if (!text) return <p style={{ margin: 0, color: '#9ca3af' }}>—</p>;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ margin: 0 }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
          <span style={{ color: '#1e3a5f', fontWeight: 600 }}>•</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}
