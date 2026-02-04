# json-polish

A tiny JSON formatter you can use as:
- a **CLI** (pretty-print + validate + optional sort keys)
- a **free web tool** (GitHub Pages)

## Web tool (free)

https://steveli31415.github.io/json-polish/

## Install

### npx (no install)

```bash
npx json-polish '{"a":1,"b":[2,3]}'
```

### Global

```bash
npm i -g json-polish
json-polish '{"a":1,"b":[2,3]}'
```

## Usage

```bash
json-polish [--indent N] [--sort-keys] [--compact] [--out FILE] [JSON|FILE]
```

### Examples

Pretty print a JSON string:

```bash
json-polish '{"a":1,"b":[2,3]}'
```

Pretty print from stdin:

```bash
cat input.json | json-polish
```

Sort object keys (stable output):

```bash
cat input.json | json-polish --sort-keys
```

Write to a file:

```bash
json-polish input.json --indent 4 --out pretty.json
```

## Notes

- If `[JSON|FILE]` is omitted, `json-polish` reads from stdin.
- If the argument points to an existing file, it reads JSON from that file.
- Output always ends with a trailing newline.

## License

MIT
