# Project prize recognition

Published prize winners use the same recognition component across the project archive, event grids, builder pages, recommendations and project details.

- Cards lead with a high-contrast prize band before the project image. The band names the project as a prize winner and shows its recorded prize label.
- Detail pages show a larger prize callout before the project title, with the original prize label and event name.
- Winner labels and card accessible names are translated into EN/ES/CA/FR. Prize and event names stay as recorded.
- Long prize names wrap on narrow screens. Award text is not truncated or conveyed by the trophy icon alone.

The source of truth is the archived `winner.text` field or the live project's `award` field, both normalized to `ProjectCard.award`. This display change does not assign new awards, rankings or sponsor-prize categories. Challenge participation, technologies, votes and judging scores do not create prize recognition. Empty award values render no band.

The archive currently records Grand prize for Candit, Replexica for AQ-App and Hookdeck for Eloquent AI. Additional event winners need an authoritative prize record before receiving this treatment.

```sh
node --test tests/project-awards.test.cjs
node tests/project-awards-routes.integration.mjs http://localhost:8888
```
