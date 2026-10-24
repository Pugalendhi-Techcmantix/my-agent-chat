import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

/**
 * Standard Markdown Renderer using `react-markdown` and `remark-gfm`.
 * Fully standards-compliant:
 * - Automatically parses GFM tables, strikethroughs, checklists
 * - Code blocks with language badge & copy-to-clipboard button
 * - Clean Tailwind typography for headings, lists, blockquotes, links
 */
export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  return (
    <div className="text-slate-800 text-[14.5px] leading-relaxed wrap-break-word space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Unwrap default <pre> so <CodeBlock> handles the wrapper and copy button
          pre({ children }) {
            return <>{children}</>;
          },

          // Code blocks & Inline code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isMultiLine = String(children).includes('\n');

            if (match || isMultiLine) {
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={match ? match[1] : ''}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-800 text-[12.5px] border border-slate-200/80 font-mono font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Standard GFM Tables
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-[13.5px] border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-semibold text-xs tracking-wider">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-slate-50/70 transition-colors">
                {children}
              </tr>
            );
          },
          th({ children, style }) {
            return (
              <th
                style={style}
                className="px-3.5 py-2.5 border-r border-slate-200/60 last:border-r-0"
              >
                {children}
              </th>
            );
          },
          td({ children, style }) {
            return (
              <td
                style={style}
                className="px-3.5 py-2 border-r border-slate-100 last:border-r-0 align-top"
              >
                {children}
              </td>
            );
          },

          // Headings
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold text-slate-900 mt-5 mb-2.5 border-b border-slate-200 pb-1.5">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 border-b border-slate-100 pb-1">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-bold text-slate-900 mt-3.5 mb-1.5">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-sm font-bold text-slate-800 mt-3 mb-1 uppercase tracking-wide">
                {children}
              </h4>
            );
          },

          // Paragraphs
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
          },

          // Lists
          ul({ children }) {
            return (
              <ul className="list-disc pl-5 my-2.5 space-y-1">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 my-2.5 space-y-1">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-400 bg-indigo-50/50 pl-3.5 py-2 my-2.5 italic text-slate-700 rounded-r">
                {children}
              </blockquote>
            );
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline font-medium hover:underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className="my-4 border-t border-slate-200/80" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Code Block Component with Copy to Clipboard functionality
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="uppercase tracking-wider font-semibold text-slate-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed text-slate-100 font-mono">
        <pre className="m-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
