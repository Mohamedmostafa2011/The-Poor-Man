import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export type PdfPage = { src: string; w: number; h: number };

export type PdfState = {
  status: "idle" | "loading" | "ready" | "error";
  pages: PdfPage[];
  total: number;
  error?: string;
};

/** Turns common "share" links into direct file links where possible. */
export function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "";
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive[1]}`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen) return `https://drive.google.com/uc?export=download&id=${driveOpen[1]}`;
  if (url.includes("dropbox.com")) return url.replace(/[?&]dl=0/, "?raw=1");
  if (url.includes("github.com") && url.includes("/blob/"))
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  return url;
}

export function usePdfPages(rawUrl: string): PdfState {
  const [state, setState] = useState<PdfState>({ status: "idle", pages: [], total: 0 });

  useEffect(() => {
    const url = normalizeUrl(rawUrl);
    if (!url) {
      setState({ status: "idle", pages: [], total: 0 });
      return;
    }

    let cancelled = false;
    setState({ status: "loading", pages: [], total: 0 });

    const task = pdfjsLib.getDocument({
      url,
      withCredentials: false,
      isEvalSupported: false,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    (async () => {
      try {
        const doc = await task.promise;
        if (cancelled) return;
        const total = doc.numPages;
        const pages: PdfPage[] = [];
        setState({ status: "loading", pages: [], total });

        for (let n = 1; n <= total; n++) {
          if (cancelled) return;
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(2.2, Math.max(1, 1400 / base.width));
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          pages.push({
            src: canvas.toDataURL("image/jpeg", 0.88),
            w: canvas.width,
            h: canvas.height,
          });
          canvas.width = 0;
          canvas.height = 0;
          if (cancelled) return;
          setState({ status: n === total ? "ready" : "loading", pages: [...pages], total });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          pages: [],
          total: 0,
          error: err instanceof Error ? err.message : "Could not load the PDF.",
        });
      }
    })();

    return () => {
      cancelled = true;
      task.destroy().catch(() => undefined);
    };
  }, [rawUrl]);

  return state;
}
