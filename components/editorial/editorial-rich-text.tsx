import {
  type JSXConvertersFunction,
  RichText,
} from "@payloadcms/richtext-lexical/react";
import { createElement } from "react";
import {
  createHeadingId,
  getRichTextNodeText,
  isTrackedHeadingTag,
} from "@/lib/editorial";

type RichTextData = Parameters<typeof RichText>[0]["data"];

export function EditorialRichText({ data }: { data: unknown }) {
  return (
    <div className="min-w-0 text-[1.02rem] leading-8 text-foreground/82 [&>*:first-child]:mt-0 [&_a]:font-semibold [&_a]:text-elinsa-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-elinsa-primary/45 [&_blockquote]:pl-5 [&_blockquote]:text-foreground/70 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-40 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-normal [&_h2]:text-elinsa-dark dark:[&_h2]:text-elinsa-sky [&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:scroll-mt-40 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-normal [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:scroll-mt-40 [&_h4]:text-xl [&_h4]:font-bold [&_hr]:my-10 [&_hr]:border-border [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_p]:max-w-3xl [&_strong]:text-foreground [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {data ? (
        <RichText
          converters={createEditorialConverters()}
          data={data as RichTextData}
          disableContainer
        />
      ) : (
        <p>Conteúdo em preparação.</p>
      )}
    </div>
  );
}

function createEditorialConverters(): JSXConvertersFunction {
  const usedHeadings = new Map<string, number>();

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const tag = isTrackedHeadingTag(node.tag) ? node.tag : "h2";
      const children = nodesToJSX({
        nodes: Array.isArray(node.children) ? node.children : [],
      });
      const title = getRichTextNodeText(node).trim();
      const id = title ? createHeadingId(title, usedHeadings) : undefined;

      return createElement(tag, id ? { id } : undefined, children);
    },
  });
}
