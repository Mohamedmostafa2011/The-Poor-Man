# The Poor Man — Digital Storybook

## Set the PDF link
Open `src/config.ts` and paste the link into `PDF_URL`:

```ts
export const PDF_URL = "https://example.com/the-poor-man.pdf";
```
Or put the file in `public/pdf/` and use `PDF_URL = "pdf/the-poor-man.pdf"`.
Leave it `""` to show the built-in typed story. The narration audio is already
included (`public/audio/story-narration.mp3`).

## Publish on GitHub Pages
1. Create a GitHub repo and upload everything in this folder (including the hidden `.github` folder).
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`; the site goes live at `https://<user>.github.io/<repo>/` after the workflow finishes.

## Run locally
```
npm install
npm run dev
```
