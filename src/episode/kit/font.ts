/**
 * Gemeinsame Textur-Schrift für alle themenunabhängigen Kit-Bausteine.
 * Gleiches Muster wie `ROME_FONT`/`useRomeFont` in rome.tsx (dort privat, deshalb hier als
 * eigener Helfer): mitgelieferte Montserrat 900 (OFL-1.1, public/fonts) per FontFace laden,
 * Frame per delayRender anhalten, bis die Texturen mit der richtigen Schrift neu gezeichnet sind.
 * Nie Systemschrift (sieht auf jedem Render-Rechner anders aus).
 */
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export const KIT_FONT = "ClipsKitSans";

/** CSS-Font-String für Canvas: `ctx.font = kitFont(80)`. */
export const kitFont = (px: number, weight = 900) =>
  `${weight} ${px}px ${KIT_FONT}, 'DejaVu Sans', sans-serif`;

let fontPromise: Promise<void> | null = null;
let fontLoaded = false;

export const loadKitFont = () => {
  if (!fontPromise) {
    const face = new FontFace(
      KIT_FONT,
      `url('${staticFile("fonts/montserrat-latin-900-normal.woff2")}') format('woff2')`,
      { weight: "900" },
    );
    fontPromise = face.load().then(
      (f) => {
        document.fonts.add(f);
        fontLoaded = true;
      },
      (err) => cancelRender(err),
    );
  }
  return fontPromise;
};

/**
 * true, sobald die Kit-Schrift geladen ist. Den Rückgabewert in den Textur-Schlüssel
 * aufnehmen, damit die Textur nach dem Laden neu gezeichnet wird.
 */
export const useKitFont = () => {
  const [ready, setReady] = useState(fontLoaded);
  const [handle] = useState(() =>
    fontLoaded ? null : delayRender("Kit: Schrift laden"),
  );
  useEffect(() => {
    if (ready) {
      if (handle !== null) {
        // erst nach dem nächsten Bild freigeben, damit die neue Textur schon gezeichnet ist
        requestAnimationFrame(() =>
          requestAnimationFrame(() => continueRender(handle)),
        );
      }
      return;
    }
    loadKitFont().then(() => setReady(true));
  }, [ready, handle]);
  return ready;
};
