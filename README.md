# Nimbalyst AI Usage

A [Nimbalyst](https://github.com/nimbalyst/nimbalyst) extension that reports token use, cost, sessions, and tools across your AI sessions. It adds an **AI Usage** panel to the rail, which also opens from Window > AI Usage Report.

The report only draws the UI. Its data comes from the host over IPC (`usage-analytics:*`, `tool-usage:*`, `usage-report:open-session`), so it needs a Nimbalyst build that registers those handlers.

## Build and install

```sh
npm install
npm run build
```

Then install the folder from Nimbalyst (the extension dev kit's `extension_install` tool links it into the extensions directory). After a change, run `npm run build` and reload the extension.

## Test

```sh
npm test
npm run typecheck
```

## License

MIT. The report started as part of Nimbalyst; see `LICENSE`.
