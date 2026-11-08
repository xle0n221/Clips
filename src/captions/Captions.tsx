import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  getRemotionEnvironment,
  getStaticFiles,
  Sequence,
  useDelayRender,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import { loadFont } from "./load-font";
import { CaptionPage } from "./CaptionPage";

// Wie lange (ms) Wörter zu einer "Seite" zusammengefasst werden.
// ~200 = ein Wort pro Seite, ~1500 = viele Wörter pro Seite.
const SWITCH_CAPTIONS_EVERY_MS = 1200;

const fileExists = (src: string) => getStaticFiles().some((f) => f.src === src);

/**
 * Lädt eine Caption-JSON-Datei (Format: `Caption[]` aus @remotion/captions)
 * und zeigt sie im TikTok-Stil an. Erzeugen mit: `npm run transcribe`.
 */
export const Captions: React.FC<{
  readonly src: string;
  readonly highlightColor: string;
}> = ({ src, highlightColor }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Lade Captions: ${src}`));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    try {
      await loadFont();
      if (!fileExists(src)) {
        setCaptions([]);
        continueRender(handle);
        return;
      }
      const res = await fetch(src);
      setCaptions((await res.json()) as Caption[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, handle, src]);

  useEffect(() => {
    load();
    // Live-Neuladen bei Dateiänderung gibt es nur in Remotion Studio.
    if (!getRemotionEnvironment().isStudio) {
      return;
    }
    const watcher = watchStaticFile(src, () => load());
    return () => watcher.cancel();
  }, [load, src]);

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
        captions,
      }),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const from = Math.round((page.startMs / 1000) * fps);
        const to = Math.round(
          Math.min(
            next ? (next.startMs / 1000) * fps : Infinity,
            ((page.startMs + SWITCH_CAPTIONS_EVERY_MS) / 1000) * fps,
          ),
        );
        if (to - from <= 0) {
          return null;
        }
        return (
          <Sequence key={index} from={from} durationInFrames={to - from}>
            <CaptionPage page={page} highlightColor={highlightColor} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
