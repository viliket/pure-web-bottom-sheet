import path from "node:path";
import minifyHTML from "@lit-labs/rollup-plugin-minify-html-literals";
import { Features } from "lightningcss";
import { defineConfig } from "rollup";
import preserveDirectives from "rollup-preserve-directives";
import esbuild from "rollup-plugin-esbuild";
import vue from "unplugin-vue/rollup";
import dts from "unplugin-dts/rollup";

const transpile = (minify = false) =>
  esbuild({
    target: "es2022",
    format: "esm",
    tsconfig: "tsconfig.json",
    minify,
  });

const minifyTemplates = () =>
  minifyHTML({
    failOnError: true,
    options: {
      minifyOptions: {
        minifyCSS: {
          include: Features.Nesting,
        },
      },
    },
  });

const webSourceDir = path.join(import.meta.dirname, "src/web");
const externalWebEntryPoints = new Set(["index.client", "index.ssr"]);

const isWrapperExternal = (id: string, importer: string | undefined) => {
  if (!id.startsWith(".") && !path.isAbsolute(id)) return true;
  if (!importer) return false;

  const resolvedPath = path.resolve(path.dirname(importer), id);
  const { dir, name } = path.parse(resolvedPath);
  return dir === webSourceDir && externalWebEntryPoints.has(name);
};

export default defineConfig([
  {
    input: "src/web/index.client.ts",
    output: { file: "dist/browser.min.js", format: "esm", sourcemap: true },
    plugins: [minifyTemplates(), transpile(true)],
  },
  {
    input: ["src/web/index.client.ts", "src/web/index.ssr.ts"],
    output: { dir: "dist/web", format: "esm", sourcemap: true },
    plugins: [
      minifyTemplates(),
      transpile(),
      dts({
        include: ["src/web/**/*.ts"],
        entryRoot: "src/web",
        outDirs: "dist/web",
      }),
    ],
  },
  {
    input: "src/react/index.tsx",
    output: {
      dir: "dist/react",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src/react",
    },
    external: isWrapperExternal,
    plugins: [
      preserveDirectives(),
      transpile(),
      dts({
        include: ["src/react/**/*.ts", "src/react/**/*.tsx"],
        entryRoot: "src/react",
        outDirs: "dist/react",
      }),
    ],
  },
  {
    input: "src/vue/index.ts",
    output: { dir: "dist/vue", format: "esm", sourcemap: true },
    external: isWrapperExternal,
    plugins: [
      vue(),
      transpile(),
      dts({
        processor: "vue",
        include: ["src/vue/**/*.ts", "src/vue/**/*.vue"],
        exclude: ["src/vue/shims-vue.d.ts"],
        entryRoot: "src/vue",
        outDirs: "dist/vue",
      }),
    ],
  },
]);
