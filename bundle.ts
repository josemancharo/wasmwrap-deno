import * as esbuild from "https://deno.land/x/esbuild@v0.11.17/mod.js";

const config: Config = {
  bundle: "esm",
  minify: true,
  target: "es6",
  outDir: "dist",
  esbuildLegalComments: "none"
};

const fileNames = Deno.args;
async function bundleAll() {
  for await (const fileName of fileNames) {
    console.log(`Deno: bundling 'src/${fileName}'`);
    const bundle = await Deno.emit(`src/${fileName}`, {
      bundle: config.bundle,
      check: false,
      compilerOptions: {
          removeComments: true,
          allowJs: true,
      }
    });

    console.log(`ESBuild: transforming bundle 'src/${fileName}'`);
    const result = await esbuild.transform(bundle.files[`deno:///bundle.js`], { 
        loader: "ts", 
        minify: config.minify,
        target: config.target,
        legalComments: config.esbuildLegalComments,
    });

    console.log(`Deno: writing file '${config.outDir}/${fileName.split(".")[0]}.bundle.js'`);
    await Deno.writeTextFile(
      `${config.outDir}/${fileName.split(".")[0]}.bundle.js`,
      result.code,
    );
  }
}

bundleAll().then(() => {
  esbuild.stop();
});

type Config = {
  bundle: "esm" | "iife";
  minify: boolean,
  target: string,
  outDir: string,
  esbuildLegalComments: 'none' | 'eof' | "inline" | 'linked' | 'external',
};
