import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type AudioHandle = { play: () => void; pause: () => void; toggle: () => void };

type Props = {
  src: string;
  title: string;
  onMissingLink?: () => void;
  compact?: boolean;
};

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const SPEEDS = [0.75, 1, 1.25, 1.5];

const AudioPlayer = forwardRef<AudioHandle, Props>(function AudioPlayer(
  { src, title, onMissingLink, compact },
  ref
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);

  useImperativeHandle(ref, () => ({
    play: () => audioRef.current?.play().catch(() => undefined),
    pause: () => audioRef.current?.pause(),
    toggle: () => toggle(),
  }));

  useEffect(() => {
    setError(false);
    setTime(0);
    setDur(0);
    setPlaying(false);
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!src) {
      onMissingLink?.();
      return;
    }
    if (!a) return;
    if (a.paused) a.play().catch(() => setError(true));
    else a.pause();
  };

  const skip = (sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + sec));
  };

  const pct = dur ? (time / dur) * 100 : 0;

  return (
    <div
      className={`w-full rounded-2xl border border-amber-200/15 bg-[#1d140a]/90 px-3 py-2.5 backdrop-blur-md sm:px-4 ${
        compact ? "" : "shadow-[0_18px_40px_-20px_rgba(0,0,0,.9)]"
      }`}
    >
      <audio
        ref={audioRef}
        src={src || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        onError={() => src && setError(true)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause narration" : "Play narration"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-amber-300 to-amber-600 text-[#2a1a08] shadow-lg transition hover:brightness-110 active:scale-95"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2.5" y="1.5" width="4" height="13" rx="1" />
              <rect x="9.5" y="1.5" width="4" height="13" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.5 1.8 13.6 8 3.5 14.2z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-medium text-amber-50/90">
              {src ? title : "Listen to the story"}
            </p>
            <span className="shrink-0 font-mono text-[11px] text-amber-100/50">
              {fmt(time)} / {dur ? fmt(dur) : "--:--"}
            </span>
          </div>

          <div className="relative mt-1.5">
            <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={time}
              onChange={(e) => {
                const a = audioRef.current;
                if (a) a.currentTime = Number(e.target.value);
                setTime(Number(e.target.value));
              }}
              className="absolute inset-0 h-[6px] w-full cursor-pointer opacity-0"
              aria-label="Seek"
            />
          </div>

          {error && src && (
            <p className="mt-1 text-[11px] text-rose-300/80">
              This audio link could not be played. Use a direct file link (.mp3).
            </p>
          )}
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            onClick={() => skip(-10)}
            className="rounded-lg border border-amber-200/15 px-2 py-1.5 text-[11px] text-amber-100/70 transition hover:bg-amber-200/10"
          >
            −10s
          </button>
          <button
            onClick={() => skip(10)}
            className="rounded-lg border border-amber-200/15 px-2 py-1.5 text-[11px] text-amber-100/70 transition hover:bg-amber-200/10"
          >
            +10s
          </button>
          <button
            onClick={() => setRate(SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length])}
            className="rounded-lg border border-amber-200/15 px-2 py-1.5 text-[11px] text-amber-100/70 transition hover:bg-amber-200/10"
          >
            {rate}×
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="ml-1 w-20 cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
