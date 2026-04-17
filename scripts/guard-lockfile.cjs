#!/usr/bin/env node

const { execSync } = require('node:child_process');

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf8',
  }).trim();

  return output ? output.split('\n') : [];
}

const stagedFiles = getStagedFiles();
const packageJsonStaged = stagedFiles.includes('package.json');
const lockfileStaged = stagedFiles.includes('pnpm-lock.yaml');

if (packageJsonStaged && !lockfileStaged) {
  console.error(
    'ERROR: package.json is staged but pnpm-lock.yaml is not. Please run `pnpm install` and stage pnpm-lock.yaml.',
  );
  process.exit(1);
}

