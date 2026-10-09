import { BOOK } from "../config";
import type { StoryPage } from "../data/story";
import type { PageSide } from "./FlipBook";

export default function StoryPageView({
  page,
  index,
  total,
  side,
}: {
  page: StoryPage;
  index: number;
  total: number;
  side: PageSide;
}) {
  const padding = side === "left" ? "pl-[9%] pr-[12%]" : side === "right" ? "pl-[12%] pr-[9%]" : "px-[10%]";

  if (page.kind === "cover") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#2a1a0c] px-6 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(214,166,80,.28), transparent 60%), radial-gradient(circle at 20% 85%, rgba(120,70,20,.5), transparent 55%)",
          }}
        />
        <div className="absolute inset-[5%] rounded-[6px] border border-amber-300/25" />
        <div className="absolute inset-[7%] rounded-[4px] border border-amber-300/10" />
        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-4 text-[11px] uppercase tracking-[0.4em] text-amber-200/60">A short story</span>
          <h1 className="font-display text-[clamp(28px,5.4vw,56px)] leading-tight gold-text">{BOOK.title}</h1>
          <div className="my-5 flex items-center gap-3 text-amber-300/60">
            <span className="h-px w-10 bg-amber-300/40" />✦<span className="h-px w-10 bg-amber-300/40" />
          </div>
          <p className="font-book max-w-[22ch] text-[clamp(13px,1.5vw,17px)] italic text-amber-100/70">
            {BOOK.subtitle}
          </p>
          <p className="mt-10 text-[12px] uppercase tracking-[0.25em] text-amber-100/50">
            Written &amp; designed by
          </p>
          <p className="font-display mt-1 text-[clamp(14px,2vw,20px)] text-amber-200">{BOOK.storyBy}</p>
        </div>
      </div>
    );
  }

  if (page.kind === "end") {
    return (
      <div className={`paper relative flex h-full w-full flex-col items-center justify-center ${padding}`}>
        <div className="text-center">
          <div className="mb-4 text-3xl">🌿</div>
          <h2 className="font-display text-[clamp(22px,3.4vw,38px)] text-[#7a5a1d]">The End</h2>
          <p className="font-book mt-4 max-w-[26ch] text-[clamp(13px,1.5vw,17px)] italic leading-relaxed text-[#5a4423]">
            “Poverty is not an empty pocket — poverty is an empty heart.”
          </p>
        </div>
        <PageNumber index={index} total={total} />
      </div>
    );
  }

  if (page.kind === "credits") {
    return (
      <div className={`paper relative flex h-full w-full flex-col justify-center ${padding}`}>
        <h2 className="font-display text-center text-[clamp(16px,2.2vw,24px)] text-[#7a5a1d]">
          Made by
        </h2>
        <ul className="font-book mx-auto mt-4 space-y-1.5 text-center text-[clamp(12px,1.5vw,17px)] text-[#4a3519]">
          {BOOK.team.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="mx-auto my-5 h-px w-24 bg-[#b79a62]/50" />
        <div className="font-book space-y-1 text-center text-[clamp(11px,1.3vw,15px)] text-[#5a4423]">
          <p>Story designed by {BOOK.storyBy}</p>
          <p>Website designed by {BOOK.websiteBy}</p>
          <p className="pt-3 italic">Presented to {BOOK.presentedTo}</p>
        </div>
        <PageNumber index={index} total={total} />
      </div>
    );
  }

  return (
    <div className={`paper relative h-full w-full ${padding} flex flex-col py-[8%]`}>
      {page.chapter && (
        <p className="text-[clamp(8px,0.95vw,11px)] uppercase tracking-[0.3em]" style={{ color: "#a08049" }}>
          {page.chapter}
        </p>
      )}
      {page.heading && (
        <h2 className="font-display mt-1 text-[clamp(15px,2.3vw,27px)] leading-snug text-[#6d4f19]">
          {page.heading}
        </h2>
      )}
      {page.decor && <div className="mt-2 text-[clamp(16px,2.2vw,26px)]">{page.decor}</div>}
      <div className="mt-3 h-px w-14 bg-[#c0a570]/60" />

      <div className="font-book mt-4 space-y-3 text-[clamp(11.5px,1.42vw,18px)] leading-[1.7] text-[#3f2d15]">
        {page.paragraphs?.map((t, i) => (
          <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-1.5 first-letter:font-display first-letter:text-[2.4em] first-letter:leading-[0.86] first-letter:text-[#9a6f22]" : ""}>
            {t}
          </p>
        ))}
      </div>

      {page.pull && (
        <p className="font-book mt-auto border-l-2 border-[#c3a263] pl-3 text-[clamp(11px,1.35vw,17px)] italic leading-relaxed text-[#6b522a]">
          {page.pull}
        </p>
      )}

      <PageNumber index={index} total={total} />
    </div>
  );
}

function PageNumber({ index, total }: { index: number; total: number }) {
  return (
    <span className="pointer-events-none absolute bottom-[3.5%] left-1/2 -translate-x-1/2 font-book text-[11px] tracking-widest text-[#9a7c48]">
      {index + 1} / {total}
    </span>
  );
}
