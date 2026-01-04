import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import preserveDirectives from "rollup-preserve-directives";
import minifyTemplateLiterals from "./scripts/rollup-plugin-minify-template-literals";
import vue from "unplugin-vue/rollup";
import dts from "unplugin-dts/rollup";

import esbuild from "rollup-plugin-esbuild";

export default [
  {
    input: "src/web/index.client.ts",
    output: { file: "dist/web.client.js", format: "esm" },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["rollup.config.ts"],
      }),
      minifyTemplateLiterals({
        htmlnano: { collapseWhitespace: "aggressive", minifyCss: false },
        cssnano: { preset: "default" },
      }),
      terser(),
    ],
  },
  {
    input: "src/web/index.ssr.ts",
    output: { file: "dist/web.ssr.js", format: "esm" },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["rollup.config.ts"],
      }),
      minifyTemplateLiterals({
        htmlnano: { collapseWhitespace: "aggressive", minifyCss: false },
        cssnano: { preset: "default" },
      }),
      terser(),
    ],
  },
  {
    input: {
      index: "src/react/index.tsx",
    },
    output: {
      dir: "dist/react",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    external: ["react", "react-dom", "react/jsx-runtime"],
    plugins: [
      typescript({
        jsx: "react-jsx",
        tsconfig: "./tsconfig.json",
        exclude: ["rollup.config.ts", "src/vue/**"],
        compilerOptions: {
          outDir: "dist/react",
        },
      }),
      minifyTemplateLiterals({
        htmlnano: { collapseWhitespace: "aggressive", minifyCss: false },
        cssnano: { preset: "default" },
      }),
      preserveDirectives(),
    ],
  },
  {
    input: "src/vue/index.ts",
    output: {
      dir: "dist/vue",
      format: "esm",
      sourcemap: true,
    },
    external: ["vue"],
    plugins: [
      vue({
        include: [/\.vue$/],
      }),
      esbuild({
        target: "esnext",
        sourceMap: true,
        tsconfig: "tsconfig.json",
      }),
      dts({
        processor: "vue",
        tsconfigPath: "./tsconfig.json",
        exclude: ["rollup.config.ts"],
      }),
      minifyTemplateLiterals({
        htmlnano: { collapseWhitespace: "aggressive", minifyCss: false },
        cssnano: { preset: "default" },
        postcssNesting: {},
      }),
    ],
  },
];
