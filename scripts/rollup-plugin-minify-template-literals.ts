import type { Plugin } from "rollup";
import htmlnano, { HtmlnanoOptions } from "htmlnano";
import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import type { pluginOptions as postcssNestingOptions } from "postcss-nesting";
import cssnano from "cssnano";

export interface MinifierOptions {
  htmlnano?: HtmlnanoOptions;
  cssnano?: cssnano.Options;
  postcssNesting?: postcssNestingOptions;
}

export default function minifyTemplateLiterals(
  options: MinifierOptions = {},
): Plugin {
  return {
    name: "minify-template-literals",

    async transform(code: string, id: string) {
      if (!id.endsWith(".js") && !id.endsWith(".ts")) return null;

      const htmlTagRegex = /\/\*\s*html\s*\*\/\s*`([\s\S]*?)`/g;
      const cssTagRegex = /\/\*\s*css\s*\*\/\s*`([\s\S]*?)`/g;

      let transformed = code;

      transformed = await replaceAsync(
        transformed,
        htmlTagRegex,
        async (_, content) => {
          const result = await htmlnano.process(
            content,
            options.htmlnano || {},
          );
          return `/*html*/\`${result.html}\``;
        },
      );

      transformed = await replaceAsync(
        transformed,
        cssTagRegex,
        async (_, content) => {
          const result = await postcss([
            postcssNesting(options.postcssNesting ?? {}),
            cssnano(options.cssnano ?? {}),
          ]).process(content, { from: undefined });
          return `/*css*/\`${result.css}\``;
        },
      );

      return {
        code: transformed,
        map: null,
      };
    },
  };
}

// Helper function for async string replacement
async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: string[]) => Promise<string>,
): Promise<string> {
  const promises: Promise<string>[] = [];
  str.replace(regex, (match, ...args) => {
    promises.push(asyncFn(match, ...args));
    return match;
  });

  const data = await Promise.all(promises);
  let i = 0;
  return str.replace(regex, () => data[i++]);
}
