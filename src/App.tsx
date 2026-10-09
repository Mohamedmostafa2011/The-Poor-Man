import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FlipBook, { type FlipBookHandle, type PageSide } from "./components/FlipBook";
import AudioPlayer, { type AudioHandle } from "./components/AudioPlayer";
import StoryPageView from "./components/StoryPageView";
import { STORY } from "./data/story";
import { AUDIO_URL, BOOK, PDF_URL } from "./config";
import { normalizeUrl, usePdfPages } from "./hooks/usePdfPages";

export default function App() {
  const links = { pdf: PDF_URL, audio: AUDIO_URL };
  const [view, setView] = useState<"home" | "read">("home");
  const [spread, setSpread] = useState({ index: 0, step: 1 });
  const bookRef = useRef<FlipBookHandle | null>(null);
  const audioRef = useRef<AudioHandle | null>(null);

  const [storyOnly, setStoryOnly] = useState(false);
  const pdf = usePdfPages(storyOnly ? "" : links.pdf);
  const usingPdf = !storyOnly && Boolean(links.pdf) && pdf.status !== "error" && (pdf.total > 0 || pdf.status === "loading");
  const pdfBroken = !storyOnly && Boolean(links.pdf) && pdf.status === "error";

  const pageCount = usingPdf && pdf.total > 0 ? pdf.total : STORY.length;
  const pageAspect = usingPdf && pdf.pages[0] ? pdf.pages[0].w / pdf.pages[0].h : 0.72;

  const renderPage = useCallback(
    (i: number, side: PageSide) => {
      if (usingPdf) {
        const p = pdf.pages[i];
        if (!p) {
          return (
            <div className="paper flex h-full w-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c3a263]/40 border-t-[#8a6a2a]" />
            </div>
          );
        }
        return (
          <div className="h-full w-full bg-white">
            <img src={p.src} alt={`Page ${i + 1}`} className="h-full w-full object-contain" draggable={false} />
          </div>
        );
      }
      return <StoryPageView page={STORY[i]} index={i} total={STORY.length} side={side} />;
    },
    [usingPdf, pdf.pages]
  );

  const onBookChange = useCallback((index: number, step: number) => setSpread({ index, step }), []);

  const pageLabel = useMemo(() => {
    const a = spread.index + 1;
    const b = Math.min(spread.index + spread.step, pageCount);
    return spread.step === 2 && b > a ? `${a}–${b}` : `${a}`;
  }, [spread, pageCount]);

  useEffect(() => {
    document.body.style.overflow = view === "read" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  const openReader = (withAudio: boolean) => {
    setView("read");
    if (!withAudio) return;
    window.setTimeout(() => audioRef.current?.play(), 350);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined);
    else document.exitFullscreen?.().catch(() => undefined);
  };

  /* ================= HOME ================= */
  if (view === "home") {
    return (
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#140d06] text-amber-50">
        <Backdrop />

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="font-display text-sm tracking-[0.3em] text-amber-200/70">E · M</span>
        </header>

        <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-6 md:grid-cols-[1.05fr_1fr] md:gap-8 md:pt-10">
          <div className="animate-float-up">
            <p className="mb-4 text-[11px] uppercase tracking-[0.45em] text-amber-200/60">
              Digital storybook
            </p>
            <h1 className="font-display text-[clamp(44px,9vw,86px)] leading-[0.95] gold-text">
              The Poor Man
            </h1>
            <p className="font-book mt-5 max-w-lg text-[clamp(16px,2.2vw,21px)] leading-relaxed text-amber-100/75">
              {BOOK.subtitle}. Flip through the pages with your finger, and let the story be read
              aloud to you while you read along.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => openReader(false)}
                className="rounded-full bg-gradient-to-b from-amber-300 to-amber-600 px-7 py-3.5 text-sm font-semibold text-[#2a1a08] shadow-[0_14px_30px_-12px_rgba(233,195,114,.8)] transition hover:brightness-110 active:scale-95"
              >
                📖 Open the book
              </button>
              <button
                onClick={() => openReader(true)}
                className="rounded-full border border-amber-200/25 px-7 py-3.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/10 active:scale-95"
              >
                🎧 Read &amp; listen
              </button>
              {links.pdf && (
                <a
                  href={normalizeUrl(links.pdf)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-amber-200/15 px-6 py-3.5 text-sm text-amber-100/70 transition hover:bg-amber-200/10"
                >
                  ⬇ PDF
                </a>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-amber-100/45">
              <span>↔ Swipe or drag a page corner</span>
              <span>⌨ Arrow keys</span>
              <span>🔊 Listen while reading</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-float-up [animation-delay:120ms]">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-r-2xl rounded-l-md border border-amber-300/20 shadow-[0_50px_90px_-30px_rgba(0,0,0,.95)]"
              style={{ transform: "perspective(1400px) rotateY(-14deg) rotateX(3deg)" }}
            >
              <StoryPageView page={STORY[0]} index={0} total={STORY.length} side="single" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/70 to-transparent" />
            </div>
          </div>
        </main>

        <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Story design" value={BOOK.storyBy} icon="✍️" />
            <Card title="Website design" value={BOOK.websiteBy} icon="💻" />
            <Card title="Presented to" value={`Mrs. ${BOOK.presentedTo.replace(/^Mrs\.\s*/i, "")}`} icon="🎓" />
          </div>

          <div className="mt-6 rounded-3xl border border-amber-200/12 bg-gradient-to-b from-amber-200/[0.06] to-transparent p-6 sm:p-8">
            <h3 className="font-display text-center text-xl text-amber-100">Made by</h3>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {BOOK.team.map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-amber-200/18 bg-black/25 px-4 py-2 text-[13px] text-amber-100/85"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="font-book mt-6 text-center text-[15px] italic text-amber-100/50">
              Scan · Read · Listen — the back cover of the printed story leads right here.
            </p>
          </div>
        </section>

        <footer className="relative z-10 border-t border-amber-200/10 px-5 py-6 text-center text-[12px] text-amber-100/35">
          “The Poor Man” — story &amp; website designed by {BOOK.storyBy} · Presented to {BOOK.presentedTo}
        </footer>
      </div>
    );
  }

  /* ================= READER ================= */
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#140d06] text-amber-50">
      <Backdrop />

      {/* top bar */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-amber-200/10 bg-black/25 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <button
          onClick={() => setView("home")}
          className="rounded-full border border-amber-200/15 px-3 py-1.5 text-[12px] text-amber-100/75 transition hover:bg-amber-200/10"
        >
          ← Cover
        </button>
        <div className="min-w-0 text-center">
          <p className="font-display truncate text-[13px] tracking-wide text-amber-100 sm:text-base">
            {BOOK.title}
          </p>
          <p className="text-[11px] text-amber-100/40">
            Page {pageLabel} of {pageCount}
            {usingPdf && pdf.status === "loading" ? " · preparing…" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="hidden rounded-full border border-amber-200/15 px-3 py-1.5 text-[12px] text-amber-100/75 transition hover:bg-amber-200/10 sm:block"
          >
            ⛶
          </button>
        </div>
      </header>

      {/* book */}
      <main className="relative z-10 min-h-0 flex-1 px-2 py-3 sm:px-8 sm:py-6">
        {pdfBroken ? (
          <PdfFallback url={normalizeUrl(links.pdf)} message={pdf.error} onUseStory={() => setStoryOnly(true)} />
        ) : (
          <FlipBook
            ref={bookRef}
            pageCount={pageCount}
            pageAspect={pageAspect}
            renderPage={renderPage}
            onChange={onBookChange}
          />
        )}

        {usingPdf && pdf.pages.length === 0 && pdf.status === "loading" && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#140d06]/85 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
              <p className="font-display mt-4 text-sm tracking-widest text-amber-200/80">
                PREPARING THE PAGES…
              </p>
            </div>
          </div>
        )}
      </main>

      {/* bottom controls */}
      <footer className="relative z-20 shrink-0 space-y-2 border-t border-amber-200/10 bg-black/30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <button
            onClick={() => bookRef.current?.prev()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber-200/20 text-amber-100/80 transition hover:bg-amber-200/10 active:scale-95"
            aria-label="Previous page"
          >
            ‹
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(0, pageCount - 1)}
            value={spread.index}
            onChange={(e) => bookRef.current?.goTo(Number(e.target.value))}
            className="h-[6px] w-full cursor-pointer"
            aria-label="Go to page"
          />
          <button
            onClick={() => bookRef.current?.next()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber-200/20 text-amber-100/80 transition hover:bg-amber-200/10 active:scale-95"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
        <div className="mx-auto max-w-4xl">
          <AudioPlayer
            ref={audioRef}
            src={normalizeUrl(links.audio)}
            title={`${BOOK.title} — read aloud`}
            compact
          />
        </div>
      </footer>
    </div>
  );
}

function Backdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(120,80,25,.35), transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(80,45,12,.45), transparent 55%), #140d06",
      }}
    />
  );
}

function Card({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/12 bg-black/25 p-5">
      <div className="text-xl">{icon}</div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-amber-200/50">{title}</p>
      <p className="font-display mt-1 text-lg text-amber-100">{value}</p>
    </div>
  );
}

function PdfFallback({
  url,
  message,
  onUseStory,
}: {
  url: string;
  message?: string;
  onUseStory: () => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-3">
      <div className="rounded-2xl border border-amber-200/15 bg-amber-200/5 p-4 text-[13px] text-amber-100/75">
        <p className="font-medium text-amber-200">The PDF could not be turned into flip pages.</p>
        <p className="mt-1 text-amber-100/55">
          {message ? `${message}. ` : ""}The file host probably blocks direct reading (CORS). Showing a
          simple viewer instead —{" "}
          <a href={url} target="_blank" rel="noreferrer" className="underline">
            open the PDF in a new tab
          </a>{" "}
          or{" "}
          <button onClick={onUseStory} className="underline">
            read the built-in story
          </button>
          .
        </p>
      </div>
      <iframe src={url} title="Story PDF" className="min-h-0 w-full flex-1 rounded-2xl border border-amber-200/10 bg-white" />
    </div>
  );
}
