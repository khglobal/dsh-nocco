
Retro (1990s web)
- Its own small design system, with no component library. Plain HTML is already styled: headings in a serif face, links blue and underlined, inputs and selects bevelled, `hr` as a ruled line.
- Components, auto-imported: `RetroBox` (props `title`, `tone` of `primary` or `plain`; slot `action`), `RetroButton` (`variant` of `bevel` or `oval`, `type`, `disabled`), `RetroPanel` (`title`), `RetroField` (`label`, `hint`, `error`; the control goes in the slot), `RetroBadge` (`tone`, `blink`), `RetroTicker` (`seconds`).
- Classes from `assets/css/retro.css`: `retro-table` on a table, `retro-dots` on a list, `retro-row` with `retro-grow` for boxes beside a panel, `retro-stack` for vertical spacing, `retro-muted`, `retro-small`, `retro-center`, `retro-note`.
- `layouts/default.vue` holds the tiled sidebar, the masthead and the footer; add the system's pages to its `sections` and `footer` link lists.
- Keep the period look: square corners, flat colours from the palette, no soft shadows, gradients or rounded cards. Add a new component in the same manner when the ones above do not cover a need.
