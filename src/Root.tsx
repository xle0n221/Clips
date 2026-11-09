import { Composition, staticFile } from "remotion";
import {
  Animated3DVideo,
  animated3DSchema,
  calculateAnimated3DMetadata,
  FPS,
} from "./animated-3d/Animated3DVideo";
import {
  calculateEpisodeMetadata,
  Episode,
  episodeSchema,
  FPS as EPISODE_FPS,
} from "./episode/Episode";
import {
  OVERLAY_DEMO_FRAMES,
  OVERLAY_EDGE_FRAMES,
  OverlayDemo,
  OverlayEdgeCases,
} from "./episode/overlays/OverlayDemo";
import { getMediaMetadata } from "./phone-demo/helpers/get-media-metadata";
import { myCompSchema, Scene } from "./phone-demo/Scene";
import { ROME_TEST_FRAMES, RomeKitTest } from "./RomeKitTest";

// Jede <Composition> erscheint als Eintrag in der Seitenleiste von Remotion Studio.
// Docs: https://remotion.dev/docs  ·  https://remotion.dev/docs/three
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Erklärvideo-Episode: Daten aus public/episodes/<id>/ (erzeugt mit make_episode.py) */}
      <Composition
        id="SolarSystem"
        component={Episode}
        width={1080}
        height={1920}
        fps={EPISODE_FPS}
        durationInFrames={EPISODE_FPS * 90}
        schema={episodeSchema}
        defaultProps={{ episode: "solar-system" }}
        calculateMetadata={calculateEpisodeMetadata}
      />

      {/* Rom-Video „WORST JOB IN ROME“: gleiche Episode-Maschine, eigene Szenen (scenes/rome*.tsx) */}
      <Composition
        id="RomanEmpire"
        component={Episode}
        width={1080}
        height={1920}
        fps={EPISODE_FPS}
        durationInFrames={EPISODE_FPS * 90}
        schema={episodeSchema}
        defaultProps={{ episode: "roman-empire" }}
        calculateMetadata={calculateEpisodeMetadata}
      />

      {/* Prüf-Komposition des Rom-Bau-Kits (src/episode/kit/rome.tsx) */}
      <Composition
        id="RomeKitTest"
        component={RomeKitTest}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={ROME_TEST_FRAMES}
      />

      {/* Overlays (HUD, Auswahlkarten, Pills, Akzentwörter) – Vorführung ohne Ton */}
      <Composition
        id="OverlayDemo"
        component={OverlayDemo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={OVERLAY_DEMO_FRAMES}
      />
      {/* Randfälle der Overlays (lange Texte, 4 Karten, Pills am Rand, Balken 0/1) */}
      <Composition
        id="OverlayEdgeCases"
        component={OverlayEdgeCases}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={OVERLAY_EDGE_FRAMES}
      />

      {/* Eigene 3D-Szene im Hochformat (TikTok/Reels/Shorts) mit Audio + Captions */}
      <Composition
        id="Animated3D"
        component={Animated3DVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={FPS * 10}
        schema={animated3DSchema}
        calculateMetadata={calculateAnimated3DMetadata}
        defaultProps={{
          title: "Clips 3D",
          accentColor: "#39E508",
          audioFile: "",
          captionsFile: "captions/demo.json",
        }}
      />

      {/* Original-Beispiel aus dem offiziellen Remotion-Three-Template:
          Video als Textur auf einem rotierenden 3D-Smartphone. */}
      <Composition
        id="PhoneDemo"
        component={Scene}
        fps={30}
        durationInFrames={300}
        width={1280}
        height={720}
        schema={myCompSchema}
        defaultProps={{
          deviceType: "phone",
          phoneColor: "rgb(110, 152, 191)" as const,
          baseScale: 1,
          mediaMetadata: null,
          videoSrc: null,
        }}
        calculateMetadata={async ({ props }) => {
          const videoSrc =
            props.deviceType === "phone"
              ? staticFile("phone.mp4")
              : staticFile("tablet.mp4");
          const mediaMetadata = await getMediaMetadata(videoSrc);
          return { props: { ...props, mediaMetadata, videoSrc } };
        }}
      />
    </>
  );
};
