/* =========================================================================
 *  ✏️  EDIT ME  —  This is the only file you need to touch.
 *
 *  PDF_URL : paste the direct link to the story PDF between the quotes.
 *            Leave it "" to show the built-in typed story pages instead.
 *
 *            Examples:
 *              "https://example.com/the-poor-man.pdf"
 *              "pdf/the-poor-man.pdf"   (a file you put in /public/pdf/)
 *
 *  ⚠️  Use a *direct* file link the browser is allowed to download (CORS).
 *      A PDF inside this repo (public/pdf/...) always works. Other good hosts:
 *      GitHub raw links, Cloudinary, Firebase Storage, Supabase, Dropbox
 *      (?dl=0 -> ?raw=1). Google Drive often blocks direct reading; if the
 *      flip pages can't be built the site falls back to a simple PDF viewer.
 *
 *  AUDIO_URL is already set to the narration included in this project
 *  (public/audio/story-narration.mp3).
 * =======================================================================*/

export const PDF_URL = "https://huggingface.co/datasets/MidoSTM11/Mido/resolve/main/THE%20POOR%20MAN_20261010_160010_0000.pdf";

export const AUDIO_URL = `${import.meta.env.BASE_URL}audio/story-narration.mp3`;

/* ------------------------------------------------------------------ */

export const BOOK = {
  title: "The Poor Man",
  subtitle: "A short story about the richest kind of poverty",
  storyBy: "Eyad Mostafa",
  websiteBy: "Eyad Mostafa",
  presentedTo: "Mrs. Safaa",
  team: ["Eyad Mostafa", "Adham Ahmed", "Adam Eissa", "Eyad Sameh", "Ahmed Mohamed"],
};
