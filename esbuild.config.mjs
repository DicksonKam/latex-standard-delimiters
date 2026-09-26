import esbuild from "esbuild";
import { builtinModules } from "node:module";

const production = process.argv[2] === "production";

await esbuild.build({
  banner: {
    js: "/* LaTeX Standard Delimiters. MIT. Based on Andreas Burger's latex-delimiter-renderer. See included source, LICENSE and NOTICE.md. */"
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtinModules
  ],
  format: "cjs",
  target: "es2022",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  minify: production,
  outfile: "main.js"
});
