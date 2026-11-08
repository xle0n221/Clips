import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const CAPTION_FONT = "Montserrat";

let loading: Promise<void> | null = null;
let loaded = false;

/** Lädt Montserrat 900 (OFL-1.1, aus @fontsource/montserrat) vor dem ersten Frame. */
export const loadCaptionFont = () => {
  if (!loading) {
    const handle = delayRender("Schrift laden");
    const font = new FontFace(
      CAPTION_FONT,
      `url('${staticFile("fonts/montserrat-latin-900-normal.woff2")}') format('woff2')`,
      {
        weight: "900",
      },
    );
    loading = font.load().then((f) => {
      document.fonts.add(f);
      loaded = true;
      continueRender(handle);
    });
  }
  return loading;
};

/**
 * true, sobald Montserrat geladen ist. Für Bausteine, die mit `fitText`/`measureText` messen:
 * erst danach messen, denn `measureText` merkt sich jedes Ergebnis (Cache je Text) – eine Messung
 * mit der Ersatzschrift bliebe sonst für den ganzen Render-Tab falsch (Prüfbild: Mauszeiger über
 * dem Wortende, weil die Textbreite zu schmal gemessen war). Hält den Frame per delayRender an,
 * bis nach dem Laden neu gezeichnet wurde.
 */
export const useCaptionFontReady = () => {
  const [ready, setReady] = useState(loaded);
  const [handle] = useState(() =>
    loaded ? null : delayRender("Schrift für Overlay-Messung"),
  );
  useEffect(() => {
    if (handle === null) return;
    if (ready) {
      continueRender(handle);
      return;
    }
    loadCaptionFont().then(() => setReady(true));
  }, [ready, handle]);
  return ready;
};
