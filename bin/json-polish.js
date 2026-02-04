#!/usr/bin/env node

import fs from 'node:fs';

function usage(code = 0) {
  const msg = `json-polish — pretty-print JSON

Usage:
  json-polish [--indent N] [--sort-keys] [--compact] [--out FILE] [JSON|FILE]

Examples:
  json-polish '{"a":1,"b":[2,3]}'
  cat input.json | json-polish --sort-keys
  json-polish input.json --indent 4 --out pretty.json

Notes:
  - If JSON|FILE is omitted, reads from stdin.
  - If the argument points to an existing file, reads JSON from that file.
`;
  process.stdout.write(msg);
  process.exit(code);
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function readStdin() {
  // If no stdin, return empty string.
  if (process.stdin.isTTY) return '';
  return fs.readFileSync(0, 'utf8');
}

function tryReadFile(path) {
  try {
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      return fs.readFileSync(path, 'utf8');
    }
  } catch {
    // ignore
  }
  return null;
}

function stableStringify(value, { indent, sortKeys, compact }) {
  const space = compact ? 0 : indent;
  if (!sortKeys) return JSON.stringify(value, null, space);

  const seen = new WeakSet();

  const normalize = (v) => {
    if (v && typeof v === 'object') {
      if (seen.has(v)) throw new TypeError('Circular structure in JSON');
      seen.add(v);

      if (Array.isArray(v)) return v.map(normalize);

      const out = {};
      for (const k of Object.keys(v).sort()) out[k] = normalize(v[k]);
      return out;
    }
    return v;
  };

  return JSON.stringify(normalize(value), null, space);
}

const args = process.argv.slice(2);

let indent = 2;
let sortKeys = false;
let compact = false;
let outFile = null;

let positional = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];

  if (a === '-h' || a === '--help') usage(0);
  if (a === '--indent') {
    const n = Number(args[++i]);
    if (!Number.isFinite(n) || n < 0 || n > 16) die('Error: --indent must be a number between 0 and 16');
    indent = n;
    continue;
  }
  if (a.startsWith('--indent=')) {
    const n = Number(a.split('=')[1]);
    if (!Number.isFinite(n) || n < 0 || n > 16) die('Error: --indent must be a number between 0 and 16');
    indent = n;
    continue;
  }
  if (a === '--sort-keys') {
    sortKeys = true;
    continue;
  }
  if (a === '--compact') {
    compact = true;
    continue;
  }
  if (a === '--out') {
    outFile = args[++i];
    if (!outFile) die('Error: --out requires a file path');
    continue;
  }
  if (a.startsWith('--out=')) {
    outFile = a.split('=')[1];
    if (!outFile) die('Error: --out requires a file path');
    continue;
  }
  if (a.startsWith('-')) die(`Error: unknown option ${a}. Use --help.`);

  positional.push(a);
}

if (positional.length > 1) {
  die('Error: too many arguments. Provide a JSON string OR a file path, or use stdin.');
}

let input = '';

if (positional.length === 1) {
  const maybeFile = tryReadFile(positional[0]);
  input = maybeFile ?? positional[0];
} else {
  input = readStdin();
}

if (!input || !input.trim()) {
  usage(1);
}

let parsed;
try {
  parsed = JSON.parse(input);
} catch (e) {
  die(`Invalid JSON: ${e.message}`);
}

let output;
try {
  output = stableStringify(parsed, { indent, sortKeys, compact }) + '\n';
} catch (e) {
  die(`Error: ${e.message}`);
}

if (outFile) {
  fs.writeFileSync(outFile, output, 'utf8');
} else {
  process.stdout.write(output);
}
