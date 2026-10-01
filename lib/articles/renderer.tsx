import type { Article, ArticleBlock } from "./schema";

/**
 * Safe article renderer: every block is rendered as JSX from validated data.
 * Never uses dangerouslySetInnerHTML — text nodes are escaped by React.
 */
export function ArticleRenderer({ article }: { article: Article }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold leading-snug text-ink-950">{article.title}</h1>
      <div className="space-y-6">
        {article.blocks.map((block, i) => (
          <Block key={block.id ?? i} block={block} />
        ))}
      </div>
    </article>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      if (block.level === 1)
        return <h2 className="mt-10 text-2xl font-bold text-ink-950">{block.text}</h2>;
      if (block.level === 2)
        return <h3 className="mt-8 text-xl font-bold text-ink-900">{block.text}</h3>;
      return <h4 className="mt-6 text-lg font-semibold text-ink-900">{block.text}</h4>;

    case "paragraph":
      return <p className="leading-8 text-ink-800">{block.text}</p>;

    case "list":
      const items = block.items.map((item, i) => (
        <li key={i} className="leading-7 text-ink-800">
          {item}
        </li>
      ));
      return block.ordered ? (
        <ol className="list-decimal space-y-1 pr-6">{items}</ol>
      ) : (
        <ul className="list-disc space-y-1 pr-6">{items}</ul>
      );

    case "definition":
      return (
        <dl className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <dt className="font-bold text-brand-900">{block.term}</dt>
          <dd className="mt-1 leading-7 text-ink-800">{block.definition}</dd>
        </dl>
      );

    case "note": {
      const toneClass =
        block.tone === "warning"
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : block.tone === "tip"
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : "border-sky-300 bg-sky-50 text-sky-950";
      return (
        <div className={`rounded-xl border p-4 leading-7 ${toneClass}`}>
          <span className="mb-1 block text-sm font-bold">
            {block.tone === "warning" ? "تنبيه" : block.tone === "tip" ? "ملاحظة مفيدة" : "ملاحظة"}
          </span>
          {block.text}
        </div>
      );
    }

    case "example":
      return (
        <figure className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          {block.title && (
            <figcaption className="mb-2 text-sm font-bold text-ink-600">مثال: {block.title}</figcaption>
          )}
          <div className="leading-8 text-ink-900">{block.text}</div>
        </figure>
      );
  }
}
