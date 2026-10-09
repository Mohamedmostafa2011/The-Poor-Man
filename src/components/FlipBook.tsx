import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PageSide = "left" | "right" | "single";

export type FlipBookHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
};

type FlipState = { dir: "next" | "prev"; progress: number; dragging: boolean };

type Props = {
  pageCount: number;
  pageAspect: number; // width / height of ONE page
  renderPage: (index: number, side: PageSide) => ReactNode;
  onChange?: (index: number, step: number) => void;
};

const EASE = "transform 700ms cubic-bezier(.33,.06,.24,1)";
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const FlipBook = forwardRef<FlipBookHandle, Props>(function FlipBook(
  { pageCount, pageAspect, renderPage, onChange },
  ref
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const timer = useRef<number | null>(null);
  const drag = useRef<{ x: number; dir: "next" | "prev"; moved: boolean; width: number } | null>(null);

  /* ---------- responsive measuring ---------- */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const twoPage = box.w >= 820 && box.w / box.h > 1.15;
  const step = twoPage ? 2 : 1;

  // keep index aligned to the current layout
  useEffect(() => {
    setIndex((i) => (twoPage ? i - (i % 2) : i));
  }, [twoPage]);

  useEffect(() => {
    onChange?.(index, step);
  }, [index, step, onChange]);

  /* ---------- geometry ---------- */
  const bookAspect = twoPage ? pageAspect * 2 : pageAspect;
  let bw = box.w;
  let bh = bw / bookAspect;
  if (bh > box.h) {
    bh = box.h;
    bw = bh * bookAspect;
  }
  const sheetW = twoPage ? bw / 2 : bw;

  const canNext = index + step < pageCount;
  const canPrev = index - step >= 0;

  /* ---------- flip control ---------- */
  const finish = useCallback(
    (dir: "next" | "prev", complete: boolean) => {
      if (timer.current) window.clearTimeout(timer.current);
      setFlip({ dir, progress: complete ? 1 : 0, dragging: false });
      timer.current = window.setTimeout(() => {
        if (complete) setIndex((i) => (dir === "next" ? i + step : i - step));
        setFlip(null);
      }, 710);
    },
    [step]
  );

  const start = useCallback(
    (dir: "next" | "prev", dragging: boolean) => {
      if (flip) return false;
      if (dir === "next" && !canNext) return false;
      if (dir === "prev" && !canPrev) return false;
      setFlip({ dir, progress: 0, dragging });
      return true;
    },
    [flip, canNext, canPrev]
  );

  const go = useCallback(
    (dir: "next" | "prev") => {
      if (flip) return;
      if (dir === "next" && !canNext) return;
      if (dir === "prev" && !canPrev) return;
      setFlip({ dir, progress: 0, dragging: false });
      window.setTimeout(() => finish(dir, true), 20);
    },
    [flip, canNext, canPrev, finish]
  );

  useImperativeHandle(ref, () => ({
    next: () => go("next"),
    prev: () => go("prev"),
    goTo: (i: number) => {
      if (flip) return;
      const target = Math.max(0, Math.min(pageCount - 1, i));
      setIndex(twoPage ? target - (target % 2) : target);
    },
  }));

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /input|textarea|select/i.test(t.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go("next");
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go("prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* ---------- pointer / swipe ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    if (flip || e.button === 2) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dir: "next" | "prev" = e.clientX - rect.left > rect.width / 2 ? "next" : "prev";
    if (!start(dir, true)) return;
    drag.current = { x: e.clientX, dir, moved: false, width: sheetW };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    const p = d.dir === "next" ? clamp01(-dx / d.width) : clamp01(dx / d.width);
    setFlip({ dir: d.dir, progress: p, dragging: true });
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dx = e.clientX - d.x;
    const p = d.dir === "next" ? clamp01(-dx / d.width) : clamp01(dx / d.width);
    finish(d.dir, !d.moved || p > 0.32);
  };

  /* ---------- which page goes where ---------- */
  const dir = flip?.dir;
  const p = flip?.progress ?? 0;

  let staticLeft = index;
  let staticRight = index + 1;
  let frontPage = -1;
  let backPage = -1;

  if (twoPage) {
    if (dir === "next") {
      staticLeft = index;
      staticRight = index + 3;
      frontPage = index + 1;
      backPage = index + 2;
    } else if (dir === "prev") {
      staticLeft = index - 2;
      staticRight = index + 1;
      frontPage = index - 1;
      backPage = index;
    }
  } else {
    if (dir === "next") {
      staticLeft = index + 1;
      frontPage = index;
      backPage = -1;
    } else if (dir === "prev") {
      staticLeft = index;
      frontPage = index - 1;
      backPage = -1;
    } else {
      staticLeft = index;
    }
  }

  const angle = dir === "next" ? -180 * p : -180 * (1 - p);
  const showPage = (i: number, side: PageSide) =>
    i >= 0 && i < pageCount ? (
      renderPage(i, side)
    ) : (
      <div className="h-full w-full paper paper-back" />
    );

  const sheetStyle: React.CSSProperties = {
    left: twoPage ? "50%" : 0,
    width: sheetW,
    height: bh,
    transformOrigin: "left center",
    transform: `rotateY(${angle}deg)`,
    transition: flip?.dragging ? "none" : EASE,
    zIndex: 40,
  };

  return (
    <div ref={wrapRef} className="h-full w-full select-none">
      {box.w > 0 && (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="scene relative touch-pan-y"
            style={{ width: bw, height: bh }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* book shadow */}
            <div
              className="pointer-events-none absolute -inset-x-6 -bottom-6 top-2 rounded-[14px]"
              style={{ boxShadow: "0 40px 80px -24px rgba(0,0,0,.85)" }}
            />

            {/* static pages */}
            {twoPage ? (
              <>
                <div className="absolute left-0 top-0 h-full overflow-hidden rounded-l-[10px] shadow-xl" style={{ width: sheetW }}>
                  {showPage(staticLeft, "left")}
                  <div className="pointer-events-none absolute inset-0 gutter-right" />
                </div>
                <div className="absolute right-0 top-0 h-full overflow-hidden rounded-r-[10px] shadow-xl" style={{ width: sheetW }}>
                  {showPage(staticRight, "right")}
                  <div className="pointer-events-none absolute inset-0 gutter-left" />
                </div>
                {/* spine */}
                <div
                  className="pointer-events-none absolute top-0 h-full"
                  style={{
                    left: sheetW - 8,
                    width: 16,
                    background: "linear-gradient(to right, rgba(0,0,0,.35), rgba(0,0,0,.08) 45%, rgba(0,0,0,.35))",
                    zIndex: 20,
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 overflow-hidden rounded-[10px] shadow-xl">{showPage(staticLeft, "single")}</div>
            )}

            {/* flipping sheet */}
            {flip && (
              <div className="absolute top-0 preserve-3d" style={sheetStyle}>
                <div className="absolute inset-0 overflow-hidden backface-hidden rounded-r-[10px] shadow-2xl">
                  {showPage(frontPage, twoPage ? "right" : "single")}
                  {twoPage && <div className="pointer-events-none absolute inset-0 gutter-left" />}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(to left, rgba(20,10,0,.45), rgba(20,10,0,0) 65%)",
                      opacity: dir === "next" ? p : 1 - p,
                    }}
                  />
                </div>
                <div
                  className="absolute inset-0 overflow-hidden backface-hidden rounded-l-[10px] shadow-2xl"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {twoPage ? (
                    <>
                      {showPage(backPage, "left")}
                      <div className="pointer-events-none absolute inset-0 gutter-right" />
                    </>
                  ) : (
                    <div className="h-full w-full paper paper-back" />
                  )}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(to right, rgba(20,10,0,.5), rgba(20,10,0,0) 65%)",
                      opacity: dir === "next" ? 1 - p : p,
                    }}
                  />
                </div>
              </div>
            )}

            {/* hover hint arrows */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2">
              {canPrev && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-amber-900/25">‹</span>
              )}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
              {canNext && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl text-amber-900/25">›</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FlipBook;
