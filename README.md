# NeuralHijack Website

An exploratory, browser-based collection of learning and practice tools for math and language, alongside small games and apps intended to make learning useful and joyful.

The site is currently static HTML, CSS, and JavaScript. Each page loads its functionality in the browser; there is no build system or account/data backend at this stage.

## Shared command prompt

The prompt is a custom HTML/JavaScript editor, not a native form or text input. The shared [js/input.js](js/input.js) owns cursor editing, command history, global key handling, built-in commands, and dispatch to page-specific handlers. It intentionally controls keyboard defaults to preserve the prompt interaction model. Future on-screen keyboards should call `NeuralHijackPrompt.input(key)` so touch and physical keys share the same editor behavior.

Pages configure the prompt with a `window.pageConfig` object before loading `js/input.js`. The shared [js/site-map.js](js/site-map.js) defines the site’s pages, directories, apps, launch arguments, aliases, and site-relative destinations.

Built-in commands:

- `help` — list shared commands and commands registered by the current page.
- `about` — describe the current page.
- `ls` — list child locations and launchable apps at the current location.
- `cd <path>` — change the prompt’s current location.
- `run <site/path> <app argument>` — launch a registered app.
- `exit` or Escape — navigate to the page’s configured exit target.
- `clear` / `cls` — clear visible prompt output.

App initialization examples:

- `run math/multiplication --facts`
- `run data/distributions/normal --plot`

The root page also accepts the legacy shorthand aliases `addition`, `multiplication`, and `normal`. Site-map `href` values must remain relative to the site root and must not start with `/`. Each page sets `pageConfig.siteRoot` relative to its own URL (`./` at the root and `../../../` from the normal plot page); the dispatcher resolves registered links against that URL. This supports both GitHub Pages project paths and custom-domain roots without hardcoding the domain or repository name.

Page commands are JavaScript handlers because executable functions cannot be represented in JSON. The `pageConfig.commands` object supplies help metadata and may bind a `run` function to an individual command; `pageConfig.onCommand(text, context)` is available for page-specific grammars such as parameter assignments. The normal plot page uses this parser for `mu=...`, `sigma=...`, `bins=...`, `samples=...`, and `reset`.

## Current tools

- [Math addition facts](math/addition/facts.html)
- [Math multiplication facts](math/multiplication/facts.html)
- [Normal distribution histogram](data/distributions/normal/plot.html)

The normal plot is a D3.js v7 SVG histogram with a maximum sample count of 1,000,000. It renders aggregate bins rather than one visual element per observation.

## Design principles

- Keep pages self-contained at runtime and suitable for static hosting.
- Prefer reusable shared mechanics with page-specific configuration and handlers.
- Preserve the custom command-prompt and keyboard interaction model.
- Use capability queries (for example, coarse-pointer detection) as input hints; use orientation and aspect-ratio media queries to adapt layout.
- Keep navigation in the site map and resolve destinations from the configured site root.
