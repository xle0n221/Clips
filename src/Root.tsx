import { Composition, staticFile } from "remotion";
import {
  Animated3DVideo,
  animated3DSchema,
  calculateAnimated3DMetadata,
  FPS,
} from "./animated-3d/Animated3DVideo";
import { getMediaMetadata } from "./phone-demo/helpers/get-media-metadata";
import { myCompSchema, Scene } from "./phone-demo/Scene";

// Jede <Composition> erscheint als Eintrag in der Seitenleiste von Remotion Studio.
// Docs: https://remotion.dev/docs  ·  https://remotion.dev/docs/three
export const RemotionRoot: React.FC = () => {
  return (
    <>
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
