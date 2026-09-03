# Festive

A one-page, seven-chapter interactive birthday card, designed for a phone
first. Not a template with a name slot — a small guided experience: a sealed
parcel you press and hold to open, a name that flips in letter by letter, a cake
whose candles you can blow out through your microphone, a deck of reasons you
tap through, the celebrant rendered as sunrises and heartbeats, a wish you launch
as a shooting star, and a letter under fireworks.

Built with Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Motion, and
canvas-confetti. Everything about the birthday person is hardcoded in one file.

---

## Make it about your person

Open **[`src/celebration.config.ts`](src/celebration.config.ts)** and edit the
values. That file is the whole configuration surface:

| Field | What it does |
| --- | --- |
| `name` | Addressed on the envelope, then the giant reveal |
| `nickname` | Used in headings and the header pill |
| `birthDate` | `YYYY-MM-DD`. Drives age, zodiac, weekday born, and every ledger number. `null` skips them |
| `age` | Overrides the computed age. `null` to derive it |
| `from` | Shown on the envelope and signed at the end |
| `theme` | `aurora` · `sunset` · `candy` · `cosmos` · `orchard` |
| `emojis` | Emoji confetti (first five used) |
| `photoUrl` | Optional portrait in the reveal chapter, or `null` |
| `music` | The synthesized "Happy Birthday" music box |
| `candles` | 1–12, or `null` for a readable handful |
| `invitation` | The line on the sealed envelope |
| `message` | The closing letter; each entry fades in as its own paragraph |
| `highlights` | The card deck of reasons (`title` + `body`) |
| `wishes` | Wishes for the year ahead |
| `siteUrl` | Only needed for a custom domain — Vercel URLs are detected |

Nothing else needs touching. The theme drives the background, the confetti
colors, the cake, the favicon, and the link-preview image.

## Run it locally

```bash
bun install
bun run dev
```

Then open http://localhost:3000.

```bash
bun run build      # production build
bun run lint       # eslint
bun run typecheck  # tsc --noEmit
```

npm, pnpm, and yarn all work too; the repo ships a `bun.lock`.

## Deploy to Vercel through GitHub

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Accept the detected defaults (Next.js, `bun install`, `bun run build`) and
   deploy. No environment variables are required.

To change the celebration later, edit `src/celebration.config.ts` and push —
Vercel rebuilds automatically.

## How it is put together

```
src/
  celebration.config.ts        the only file you edit
  app/
    layout.tsx                 fonts, theme attribute, metadata
    page.tsx                   reads the config, renders the experience
    globals.css                design tokens + the five themes
    opengraph-image.tsx        link preview, generated from the config
    icon.tsx                   favicon: the initial on the theme gradient
  lib/
    config.ts                  validates the config, derives dates and numbers
    confetti.ts                theme-aware bursts, cannons, emoji, fireworks
    palette.ts                 hex mirror of the CSS themes (for the OG image)
  hooks/
    use-melody.ts              "Happy Birthday" synthesized with Web Audio
    use-stored-wish.ts         the visitor's wish, in localStorage
  components/
    ui/                        shadcn/ui primitives
    experience/
      birthday-experience.tsx  chapter state machine, keyboard + swipe nav
      backdrop.tsx             aurora blobs, parallax starfield, shooting stars
      chapters/                the seven chapters
```

### Details worth knowing

- **No media assets.** The soundtrack is synthesized with the Web Audio API and
  the cake, envelope, and balloons are inline SVG, so the deploy is tiny and
  nothing 404s.
- **The song starts on its own.** Browsers refuse to play audio before the
  visitor interacts, and iOS additionally requires the AudioContext to be
  resumed *synchronously inside* a gesture handler. So the melody is armed on
  mount and unlocks on the very first touch, click or keypress anywhere on the
  page — which is the press that opens the parcel. A one-time `♪ tap to mute`
  hint points at the header button, and muting is remembered: no later gesture
  restarts it. Set `music: false` in the config to ship it silent.
- **The microphone is opt-in.** Tapping the flames always works, so a denied
  permission never dead-ends the experience.
- **Navigation.** A labelled stepper under the header says which chapter you
  are on (`THE CANDLES · 3 OF 7`) and its segments jump back to anything already
  seen. The bottom bar holds the one forward button and an explicit back arrow;
  swipe, arrow keys and space also work, and `M` toggles music.
- **Opening the parcel.** Press and hold anywhere on the envelope, or the
  full-width button under it, which fills as you hold and says so if you let go
  early. After a few seconds — or two short taps — a plain one-tap link appears,
  so the first screen can never be a dead end.
- **Mobile is the target.** Layouts are built for a phone and expand on larger
  screens: thumb-sized controls, the interactive part of each chapter placed
  above the fold, and fades where content passes under the fixed bars.
- **Accessibility.** Every chapter change is announced to screen readers, all
  interactive parts are real buttons with labels, and
  `prefers-reduced-motion` disables the balloons, the cursor trail, the
  confetti, and the transitions.
- **The wish** is stored in the visitor's browser only. It is never sent
  anywhere.
