import { continueRender, delayRender, staticFile } from "remotion";

export const CAPTION_FONT = "Montserrat";

let loading: Promise<void> | null = null;

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
      continueRender(handle);
    });
  }
  return loading;
};
