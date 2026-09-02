# fonts

The book's two typefaces, kept here rather than fetched from Google every time
the page opens. The story is read in places where the network is slow or simply
not there — a classroom tablet, a phone in aeroplane mode, a laptop with the
folder copied onto it — and a book whose Hindi arrives in the wrong letters
because a stylesheet timed out is not a book that works. Everything the pages
need to set their text is in this folder.

Two families, because between them they cover the text:

- **Baloo 2** carries the Devanagari — the whole of the story's Hindi.
- **Baloo Bhai 2** carries the Latin, and leads the stack in `--font` so the
  occasional English word matches the Hindi it sits beside.

Both are by Ek Type, released under the SIL Open Font License 1.1 (`OFL.txt`),
which is what lets them be committed here and travel with the repository.

And one character from a third:

- **Roboto** draws the question mark, and nothing else — in the story's
  speech, and at the end of each of the game's questions. The design sets the
  `?` in Roboto on Baloo words in both places, so each stylesheet declares a
  family from a Roboto Latin cut limited to `U+003F` and leads the relevant
  font stack with it — the mark comes from Roboto, every letter around it
  still from Baloo. Two weights, because that is what the two texts are set
  in: Semi Bold (600) for the speech in `story/style.css`, Medium (500) for
  the questions in `TCMM My Dev Game/style.css`.

Roboto is by Christian Robertson and the Roboto Project Authors, also under
the SIL Open Font License 1.1 (`OFL-Roboto.txt`).

## What is in here

- `fonts.css` — the `@font-face` rules. This is the one file a page links; it
  is Google's own generated stylesheet with the `fonts.gstatic.com` URLs
  swapped for `files/`, so the `unicode-range` splits are untouched and a
  browser still downloads only the subsets it actually paints. A page showing
  Hindi and a little English pulls the Devanagari and Latin cuts and leaves the
  Vietnamese, Gujarati and latin-ext ones alone.
- `files/` — 42 `.woff2` cuts, named `family-weight-subset.woff2`. Baloo 2 and
  Baloo Bhai 2, weights 400 through 800, in the subsets Google slices them
  into; and `roboto-500-latin.woff2` and `roboto-600-latin.woff2`, the two
  cuts the question mark needs.
  About 2 MB in total, and no single page loads more than a fraction.
- `OFL.txt` — the Baloos' licence; `OFL-Roboto.txt` — Roboto's, the same
  licence under a different copyright line.

## Linking it

Relative to the folder the page is in, replacing what used to be a `preconnect`
pair and a `fonts.googleapis.com` link:

    <link href="../fonts/fonts.css" rel="stylesheet" />

`story/index.html`, `story/scene.html` and `TCMM My Dev Game/index.html` reach
it that way; `story/tools/sync.html`, one level deeper, uses `../../fonts/`.
The `files/` URLs inside `fonts.css` are relative to the stylesheet itself, so
they resolve from wherever it is linked and none of them need touching.

`index.html` at the root deliberately links nothing: it is the redirect to the
book, painted for a moment on a slow disk and gone, and naming the family in
its inline styles is enough for the fallbacks to do the job.

## Refreshing them

There is no build step here, and no need for a routine one — the files are
fixed. If a version ever has to be pulled again, fetch Google's `css2`
stylesheet for the two families with a modern browser User-Agent (so it answers
in `woff2` rather than the older formats), download each `src` URL into
`files/` under the same `family-weight-subset` naming, and rewrite the URLs in
the CSS to match. The Roboto cuts came the same way, from
`css2?family=Roboto:wght@500` and `@600`, keeping only the `/* latin */`
block's file.
