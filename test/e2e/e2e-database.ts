import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

const e2eDatabaseNames = new Map<string, string>();
const numericConfigKeys = new Set([
  'PORT',
  'JWT_EXPIRES_IN',
  'THROTTLE_TTL',
  'THROTTLE_LIMIT',
]);

function parseEnvFile(filePath: string): Record<string, string> {
  const envFileContents = readFileSync(filePath, 'utf8');

  return envFileContents
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .reduce<Record<string, string>>((environment, line) => {
      const separatorIndex = line.indexOf('=');

      if (separatorIndex === -1) {
        return environment;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      environment[key] = rawValue.replace(/^['"]|['"]$/gu, '');
      return environment;
    }, {});
}

export function resolveE2eDatabaseName(testFilePath: string): string {
  const resolvedTestFilePath = resolve(testFilePath);
  const existingDatabaseName = e2eDatabaseNames.get(resolvedTestFilePath);

  if (existingDatabaseName) {
    return existingDatabaseName;
  }

  const databaseName = `e2e-${new Types.ObjectId().toString()}`;
  e2eDatabaseNames.set(resolvedTestFilePath, databaseName);

  return databaseName;
}

export function resolveBaseMongoUri(): string {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envFilePath = resolve(process.cwd(), '.env');
  const envValues = parseEnvFile(envFilePath);
  const mongoUri = envValues.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to run e2e tests');
  }

  return mongoUri;
}

export function buildE2eMongoUri(databaseName: string): string {
  const mongoUrl = new URL(resolveBaseMongoUri());
  mongoUrl.pathname = `/${databaseName}`;

  return mongoUrl.toString();
}

export function createE2eConfigService(
  mongoUri: string,
): Pick<ConfigService, 'get' | 'getOrThrow'> {
  const envFilePath = resolve(process.cwd(), '.env');
  const rawConfigValues = {
    ...parseEnvFile(envFilePath),
    ...process.env,
    MONGODB_URI: mongoUri,
  };
  const configValues = Object.fromEntries(
    Object.entries(rawConfigValues).map(([key, value]) => [
      key,
      numericConfigKeys.has(key) ? Number(value) : value,
    ]),
  );

  return {
    get<T>(propertyPath: string): T | undefined {
      return configValues[propertyPath] as T | undefined;
    },
    getOrThrow<T>(propertyPath: string): T {
      const value = configValues[propertyPath];

      if (value === undefined) {
        throw new Error(`${propertyPath} is required to run e2e tests`);
      }

      return value as T;
    },
  };
}
