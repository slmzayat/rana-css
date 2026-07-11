// astro.config.mjs
// Valid for Astro 6.x and 7.x.
//
// Astro 7 replaced the default Markdown processor with Sätteri (Rust), which
// does NOT run remark/rehype plugins. This config explicitly pins the
// unified pipeline via @astrojs/markdown-remark so the framework's three
// pipeline hooks keep working unchanged:
//   1. rehype-autolink-headings  -> a.heading-link (rana-rana-integrations.css)
//   2. tabindex="0" on <pre>     -> pre:focus-visible (rana.css)
//   3. Shiki dual themes         -> --shiki-dark hook (rana-rana-integrations.css)
//
// On Astro 6, `processor: unified(...)` matches the default behavior, so
// this config is a no-op change there.
//
// Dependencies:
//   npm i @astrojs/markdown-remark rehype-slug rehype-autolink-headings unist-util-visit

import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';

/**
 * Injects tabindex="0" on <pre> so keyboard users can scroll overflowing
 * code blocks (WCAG 2.1.1). Pairs with pre:focus-visible in rana.css.
 */
function rehypePreTabindex() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre') {
        node.properties = node.properties ?? {};
        node.properties.tabindex = 0;
      }
    });
  };
}

export default defineConfig({
  markdown: {
    processor: unified({
      shikiConfig: {
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      },
      rehypePlugins: [
        rehypeSlug, // required before autolink: generates the heading ids
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-link'],
              // NOTE: no tabindex here. tabindex: -1 would remove anchors
              // from keyboard tab order and dead-end the
              // a.heading-link:focus-visible rule in rana-integrations.css.
              'aria-label': 'Link to this section',
            },
            content: {
              type: 'text',
              value: '#',
            },
          },
        ],
        rehypePreTabindex,
      ],
    }),
  },
});
