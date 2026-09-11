import React from 'react';

interface FormattedBlogContentProps {
  content?: string;
  className?: string;
}

/**
 * Parses inline formatting tags:
 * - **bold text** or <b>bold text</b>
 * - *italic text* or <i>italic text</i>
 * - `code text`
 */
export const renderInlineStyles = (text: string): React.ReactNode => {
  if (!text) return null;

  // Regex matches:
  // 1: **bold**
  // 2: <b>bold</b>
  // 3: *italic*
  // 4: <i>italic</i>
  // 5: `code`
  const regex = /(\*\*.*?\*\*|<b>.*?<\/b>|\*.*?\*|<i>.*?<\/i>|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[#F3E5AB]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <strong key={index} className="font-bold text-[#F3E5AB]">
          {part.slice(3, -4)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-neutral-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith('<i>') && part.endsWith('</i>')) {
      return (
        <em key={index} className="italic text-neutral-300">
          {part.slice(3, -4)}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-neutral-800 text-[#D4A017] text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export const FormattedBlogContent: React.FC<FormattedBlogContentProps> = ({
  content = '',
  className = ''
}) => {
  if (!content || !content.trim()) {
    return <p className="text-neutral-500 italic text-sm">No content provided.</p>;
  }

  // Split into distinct blocks by double line breaks (paragraphs)
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-5 leading-relaxed text-sm sm:text-base text-[#E0E0E0] ${className}`}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1: # Title
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={bIdx} className="text-xl sm:text-2xl font-serif font-bold text-white border-b border-[#D4A017]/30 pb-2 mt-6 mb-2">
              {renderInlineStyles(trimmed.slice(2))}
            </h2>
          );
        }

        // Heading 2: ## Subtitle
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={bIdx} className="text-lg sm:text-xl font-serif font-bold text-[#E5B842] mt-6 mb-2">
              {renderInlineStyles(trimmed.slice(3))}
            </h3>
          );
        }

        // Heading 3: ### Section
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="text-base sm:text-lg font-serif font-semibold text-[#D4A017] mt-5 mb-1">
              {renderInlineStyles(trimmed.slice(4))}
            </h4>
          );
        }

        // Blockquote: > quote text
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={bIdx} className="border-l-4 border-[#D4A017] pl-4 py-2 my-4 italic text-[#F3E5AB] bg-[#141414] rounded-r-lg">
              {renderInlineStyles(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Split individual lines within paragraph
        const lines = trimmed.split('\n');

        // Bullet list if all non-empty lines start with '-' or '*'
        const isBulletList = lines.length > 0 && lines.every(l => {
          const t = l.trim();
          return t === '' || t.startsWith('- ') || t.startsWith('* ');
        });

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-2 pl-2 my-3 list-none">
              {lines.map((l, lIdx) => {
                const t = l.trim();
                if (!t) return null;
                const itemText = t.replace(/^[-*]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] mt-2 shrink-0 shadow-[0_0_6px_rgba(212,160,23,0.8)]" />
                    <span className="leading-relaxed">{renderInlineStyles(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered list if all lines start with '1. ', '2. ', etc.
        const isNumberedList = lines.length > 0 && lines.every(l => {
          const t = l.trim();
          return t === '' || /^\d+\.\s+/.test(t);
        });

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-2 pl-5 my-3 list-decimal marker:text-[#D4A017] marker:font-bold">
              {lines.map((l, lIdx) => {
                const t = l.trim();
                if (!t) return null;
                const itemText = t.replace(/^\d+\.\s+/, '');
                return (
                  <li key={lIdx} className="pl-1 leading-relaxed">
                    {renderInlineStyles(itemText)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph with soft linebreaks (<br/> for single newlines within paragraph)
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineStyles(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
