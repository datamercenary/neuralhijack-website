# Project Guidance for Claude

## Product purpose

NeuralHijack is a browser-based educational project for math and language learning/practice, with games and exploratory apps intended to provide utility and joy. Keep pages usable as standalone static resources. Accounts and persistent user data are future possibilities, not current assumptions.

## Interaction model

- The command prompt is an intentional custom editor implemented in HTML and JavaScript. Do not replace it with a native form/input as the default prompt design.
- `js/input.js` owns key handling, cursor editing, history, shared command dispatch, and global keyboard-default cancellation. Preserve and extend that interaction model rather than adding prompt-specific command branches to the shared editor.
- Future visual/on-screen keyboards should call `NeuralHijackPrompt.input(key)` so physical and virtual keys use the same editor state machine.
- Pages configure prompt behavior with `window.pageConfig`; `pageConfig.commands` supplies help metadata and can bind individual `run` functions, while `pageConfig.onCommand()` handles richer page-specific grammars. Handlers may be defined locally or supplied by a script loaded before `js/input.js`.
- Keep page-specific command help synchronized with the commands actually accepted by the handler.

## Navigation and command dispatch

- `js/site-map.js` is the shared registry for pages, directories, apps, aliases, launch arguments, and navigation destinations.
- App initialization uses commands such as `run math/multiplication --facts` and `run data/distributions/normal --plot`.
- Keep all app `href` values site-relative (no leading slash). Pages specify `pageConfig.siteRoot` relative to their own URL; resolve destinations using `new URL(href, siteRoot)`.
- Do not hardcode the deployment host or GitHub repository path. The same site should work on GitHub Pages project hosting and a custom domain.
- `cd` changes the shell's current directory; `run` launches an app registered in the site map. Do not execute arbitrary path input or treat `.exe` as an executable binary.
- Built-ins currently include `help`, `about`, `ls`, `cd`, `run`, `exit`/Escape, and `clear`/`cls`. Keep shared behavior centralized.

## Presentation and implementation

- Use the existing dark background, seafoam text, and CRT overlays in `styles.css`.
- Keep visualization surfaces transparent when the CRT background/glow should show through.
- Use responsive CSS, including orientation/aspect-ratio queries where appropriate. Use coarse-pointer capability queries as hints for touch-specific controls, not as definitive proof that no hardware keyboard exists.
- Keep static-page initialization self-contained in the browser. Add external dependencies only when useful and follow existing D3.js v7 usage where relevant.
- Avoid adding documentation files for individual changes; update README or this project guidance only when the durable conventions change.
