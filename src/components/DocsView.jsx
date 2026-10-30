import { useEffect, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Simple documentation view that fetches the project's README.md and renders it.
 * It also attempts to render Mermaid diagrams by calling mermaid.init on code blocks
 * with the language identifier "mermaid".
 */
export default function DocsView({ onClose }) {
  const [content, setContent] = useState("Loading documentation...");

  useEffect(() => {
    fetch("README.md")
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent("Failed to load documentation."));
  }, []);

  // After markdown renders, initialize mermaid if available
  useEffect(() => {
    if (typeof mermaid !== "undefined" && window.mermaid) {
      try {
        window.mermaid.run();
      } catch (e) {
        console.error("Mermaid init error", e);
      }
    }
  }, [content]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end">
      {/* Semi‑transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close documentation overlay"
      />

      {/* Panel */}
      <aside className="relative w-11/12 max-w-2xl h-full bg-white dark:bg-[#212121] shadow-2xl overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Close documentation"
          >
            ✕
          </button>
        </header>

        {/* Content */}
        <section className="p-4">
            <MarkdownRenderer content={content} />
          </section>
      </aside>
    </div>
  );
}
