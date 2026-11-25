# Festive

A one-page, seven-chapter interactive birthday card, designed for a phone
first. Not a template with a name slot — a small guided experience: a sealed
parcel you press and hold to open, a name that flips in letter by letter, a cake
whose candles you can blow out through your microphone, a deck of reasons you
tap through, the celebrant rendered as sunrises and heartbeats, a wish you launch
as a shooting star, and a letter under fireworks.

Built with Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Motion, and
canvas-confetti. Each person is one small file, every text exists in English,
Armenian and Russian, and anything a person does not set comes from a shared
default.

---

## Links

| Link | Shows |
| --- | --- |
| `/` | The standard card, addressed to no one in particular |
| `/?for=dia` | Dia's card. The name is matched ignoring case |
| `/hy?for=dia` · `/ru?for=dia` | The same card in Armenian or Russian |
| `/hy` · `/ru` | The standard card in Armenian or Russian |

A `for` that names nobody redirects to the standard card in the same
language, and an unknown language redirects to `/`.

## Add a person

1. Create `src/people/<name>.ts` — copy [`dia.ts`](src/people/dia.ts).
   Only `name` is required.
2. Register it in `PEOPLE` in
   [`src/celebration.config.ts`](src/celebration.config.ts). The key is what
   goes in the link: `anna` → `/?for=anna`. (`everyone` is taken — it is the
   standard card.)

```ts
export const anna: Person = {
  name: "Anna",
  from: "Gev",
  birthDate: "2001-03-14",
  theme: "sunset",
  texts: {
    hy: { name: "Աննա", from: "Գև" },
    ru: { name: "Анна", from: "Гев", message: ["Первый абзац.", "Второй."] },
  },
};
```

| Field | What it does |
| --- | --- |
| `name` | Addressed on the envelope, then the giant reveal |
| `nickname` | Used in headings and the header pill. Defaults to the first word of `name` |
| `from` | Shown on the envelope and signed at the end |
| `birthDate` | `YYYY-MM-DD`. Drives age, zodiac, weekday born, and every ledger number. Without it the ledger counts one ordinary year |
| `age` | Overrides the computed age |
| `theme` | `aurora` · `sunset` · `candy` · `cosmos` · `orchard` |
| `emojis` | Emoji confetti (first five used) |
| `photoUrl` | Optional portrait in the reveal chapter |
| `music` | The synthesized "Happy Birthday" music box |
| `candles` | 1–12; unset picks a readable handful |
| `texts` | Wording per language (`en`, `hy`, `ru`): any of `name`, `nickname`, `from`, `invitation`, `message`, `highlights`, `wishes` |

Every field except `name` is optional. What a person leaves out comes from
`DEFAULTS` in `src/celebration.config.ts` (theme, emoji, music…) and, for
texts, from the default wording of the language being shown. So a person with
no `texts` at all still gets a complete card in all three languages.

The theme drives the background, the confetti colors, the cake, the favicon,
and the link-preview image.

## Wording and languages

Every word on the card lives in [`src/i18n/messages/`](src/i18n/messages/):
`en.ts` is the source of truth, and `hy.ts` and `ru.ts` must have the same keys
(TypeScript refuses to build otherwise). Its `defaults` block is both the
standard card and the fallback for every person — edit a letter there and it
changes for everyone who has not written their own.

In the messages, `{name}` placeholders are filled in by the page and `*…*`
marks the words drawn in the accent gradient. Count-dependent strings list one
form per plural category (`one`/`few`/`many`/`other` in Russian). The Russian
and Armenian texts keep names in the nominative, so no name ever has to be
declined, and the Russian avoids forms that depend on the reader's gender.

To add another language: add its code to `LOCALES` in
`src/i18n/config.ts`, create `src/i18n/messages/<code>.ts`, and register it in
`src/i18n/index.ts`. If its script is not Latin or Cyrillic, it also needs
fonts (see the layout and `globals.css`) and a font for the preview images
(`src/lib/og-fonts.ts`).

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

To add or change a card later, edit `src/people/` (and register new people in
`src/celebration.config.ts`) and push — Vercel rebuilds automatically.

## How it is put together

```
src/
  celebration.config.ts        who has a card, shared defaults, site URL
  people/                      one file per person
  proxy.ts                     maps /, /hy, /ru and ?for= onto the cards
  i18n/
    config.ts                  the languages
    messages/                  every word on the card: en (source), hy, ru
    format.ts                  placeholders, plurals, ordinals
  app/
    globals.css                design tokens, the five themes, fonts per language
    [lang]/[person]/
      layout.tsx               fonts, language + theme on <html>, metadata
      page.tsx                 resolves the card, renders the experience
      opengraph-image.tsx      link preview, per person and language
      icon.tsx                 favicon: the initial on the theme gradient
  lib/
    config.ts                  merges person + defaults, derives dates and numbers
    people.ts                  matches ?for= values to people
    og-fonts.ts                Armenian glyphs for the preview images
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

- **Short links, static cards.** Every person in every language is
  prerendered at `/[lang]/[person]` (the standard card is `/[lang]/everyone`).
  `src/proxy.ts` rewrites the short link onto it — `/hy?for=dia` is served
  from `/hy/dia` — so the address bar keeps the link exactly as it was sent,
  and the language and theme can sit on `<html>`, where dialogs rendered in
  portals still see them.
- **Fonts per script.** Fraunces has no Cyrillic and none of the Latin faces
  has Armenian, so Russian headings use Literata and Armenian uses Noto Sans
  and Noto Serif Armenian. Those files are not preloaded, so only a page in
  that language downloads them. `next/og` draws with a Latin + Cyrillic face
  only, so Armenian preview images fetch an Armenian subset from Google Fonts
  when they are generated.
- **No media assets.** The soundtrack is synthesized with the Web Audio API and
  the cake, envelope, and balloons are inline SVG, so the deploy is tiny and
  nothing 404s.
- **The song starts on its own.** The melody is rendered once in the browser
  with an `OfflineAudioContext`, encoded to a WAV blob and played by a looping
  `<audio>` element. That indirection matters on iOS: audio straight out of a
  Web Audio graph is treated as *ambient* and the hardware ringer switch mutes
  it, while a media element plays through the silent switch at the volume the
  phone's buttons control. Playback still needs one interaction — that is the
  press which opens the parcel, so it feels automatic. A one-time
  `♪ tap to mute` hint points at the header button, and muting is remembered: no
  later gesture restarts it. `music: false` ships the card silent.
- **The microphone is opt-in.** Tapping the flames always works, so a refused
  permission never dead-ends the experience — and the message says *why* it was
  refused (blocked, no device, insecure origin) rather than guessing. Because
  the "playback" audio session above is playback-*only*, the candles chapter
  borrows the session as `play-and-record` for the duration of capture and hands
  it back afterwards; the song pauses while the mic is open, which also stops the
  music box being heard as breath.
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
