# Herman Scheele — Portfolio

A single-page personal portfolio. Plain HTML/CSS/JS — no build step, no dependencies.

```
portfolio_website/
├── index.html      # all content lives here
├── styles.css      # design system + effects
├── script.js       # scroll reveals, cursor glow, counters, rotating role
├── assets/         # images + favicon
│   ├── profile.jpg         ← ADD YOUR PHOTO HERE (see below)
│   ├── favicon.svg
│   ├── kriging_curve.png
│   ├── kriging_constrained.png
│   └── agent_workflow.png
├── .nojekyll       # tells GitHub Pages to serve files as-is
└── README.md
```

## Preview locally

Just open `index.html` in a browser, or run a tiny server:

```bash
cd portfolio_website
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Add your profile photo

Drop a square photo named **`profile.jpg`** into `assets/`. It appears automatically.
Until then, a gradient "HS" monogram shows in its place.

## Edit content

Everything is in **`index.html`** and clearly sectioned:
`hero` → `experience` → `research` → `projects` → `contact`.
No framework knowledge needed — edit the text between the tags.

## Deploy to GitHub Pages

This repo is set up to publish as a **project site** at
`https://hermanscheele.github.io/portfolio_website/`.

1. Create an empty repo named `portfolio_website` on GitHub (no README).
2. From this folder:
   ```bash
   git remote add origin https://github.com/hermanscheele/portfolio_website.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick `main` / `root`, save. Your site is live in ~1 minute.

## Tweak the look

Colors live in the `:root` block at the top of `styles.css`
(`--indigo`, `--violet`, `--pink`, `--cyan`) — change those four to reskin the whole site.
