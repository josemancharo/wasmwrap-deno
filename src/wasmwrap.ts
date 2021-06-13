#!/usr/bin/env node
import { parse } from "https://deno.land/std/flags/mod.ts";
import { renderCode, RenderData } from "./codegen.ts";

async function main() {
  const opts = parse(Deno.args, {
    default: {
      "input": "",
      "output": "",
      "language": "js",
      "include-decode": true,
      "help": false,
    },
  }) as unknown as CLIOptions;

  if (opts.help) {
    showHelp();
  } else {
    processInput(opts);
  }
}

function showHelp() {
  console.log(
    `
        --help            Show help [boolean]
        --version         Show version number [boolean]
        --input           Input filepath to wrap, can be any file. [string] [required]
        --output          Where to write the output, if not specified it prints the file contents to STDOUT. [string]
        --language        language of output file, by default it looks at the output filename. [choices: "js", "ts", "match"] [default: "match"]
        --include-decode  include a base64 decode function that works both in the browser and in node/deno (~1KB unminified). [boolean] [default: true]
        `,
  );
}

async function processInput(opts: CLIOptions) {
  const inFilePath = opts.input;
  const fileContents = await Deno.readFile(inFilePath);

  if (opts.language === "match") {
    if (opts.output !== undefined && opts.output.endsWith(".ts")) {
      opts.language = "ts";
    } else {
      opts.language = "js";
    }
  }

  const renderData: RenderData = {
    base64Wasm: btoa(fileContents.toString()),
    module: "esm",
    includeDecode: opts["include-decode"],
    typescript: opts.language === "ts",
  };
  const outFileContents = renderCode(renderData);

  if (opts.output == null || opts.output == "") {
    console.log(outFileContents);
  } else {
    await Deno.writeTextFile(opts.output, outFileContents);
  }
}

type CLIOptions = {
  "input": string;
  "output": string;
  "language": "js" | "ts" | "match";
  "include-decode": boolean;
  "help": boolean;
};

await main();
