const path = require('node:path');
const { generate } = require('openapi-typescript-codegen');

try {
  require('dotenv').config();
} catch {
  // dotenv is optional at runtime in case environment is provided externally.
}

const DEFAULT_INPUT_PATH = path.resolve(process.cwd(), 'openapi/openapi.json');
const DEFAULT_OUTPUT_PATH = path.resolve(process.cwd(), 'generated/api-client');

async function generateClient() {
  const inputPath = process.env.OPENAPI_OUTPUT_PATH
    ? path.resolve(process.cwd(), process.env.OPENAPI_OUTPUT_PATH)
    : DEFAULT_INPUT_PATH;
  const outputPath = process.env.CLIENT_OUTPUT_DIR
    ? path.resolve(process.cwd(), process.env.CLIENT_OUTPUT_DIR)
    : DEFAULT_OUTPUT_PATH;

  await generate({
    input: inputPath,
    output: outputPath,
    httpClient: 'fetch',
    useOptions: true,
  });

  process.stdout.write(
    `TypeScript client generated at ${outputPath} from ${inputPath}\n`,
  );
}

generateClient().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

