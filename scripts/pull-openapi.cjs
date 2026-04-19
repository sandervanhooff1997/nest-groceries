const fs = require('node:fs/promises');
const path = require('node:path');

try {
  require('dotenv').config();
} catch {
  // dotenv is optional at runtime in case environment is provided externally.
}

const DEFAULT_OPENAPI_URL = 'http://127.0.0.1:3000/api/docs-json';
const DEFAULT_OUTPUT_PATH = path.resolve(process.cwd(), 'openapi/openapi.json');

async function pullOpenApi() {
  const sourceUrl = process.env.OPENAPI_SOURCE_URL ?? DEFAULT_OPENAPI_URL;
  const outputPath = process.env.OPENAPI_OUTPUT_PATH
    ? path.resolve(process.cwd(), process.env.OPENAPI_OUTPUT_PATH)
    : DEFAULT_OUTPUT_PATH;

  const response = await fetch(sourceUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI schema from ${sourceUrl} (status ${response.status})`,
    );
  }

  const schema = await response.json();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');

  process.stdout.write(
    `OpenAPI schema saved to ${outputPath} from ${sourceUrl}\n`,
  );
}

pullOpenApi().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.stderr.write(
    'Tip: start the API first or set OPENAPI_SOURCE_URL to a reachable docs-json endpoint.\n',
  );
  process.exitCode = 1;
});

