import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  ...defaultMdxComponents,
};

export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
  return {
    ...components,
    ...overrides,
  };
}

export function useMDXComponents(): MDXComponents {
  return components;
}
