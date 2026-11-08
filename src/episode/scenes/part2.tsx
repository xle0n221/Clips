import React, { useMemo } from "react";
import { Easing } from "remotion";
import { Shot } from "../kit/camera";
import { Ground, Rock, Sky, Space } from "../kit/env";
import { Burst, Confetti, SpeedLines } from "../kit/fx";
import { Planet, PlanetKind } from "../kit/planets";
import { BlobShadow, Cake, House, Lights, Office, Rocket } from "../kit/props";
import { Boss, Milo } from "../kit/Toonie";
import { Ink, Toon, seeded } from "../kit/toon";
import { shotIndex, useScene } from "../types";
import { ease, lerp } from "./util";

/* 7 — Mars: Olympus Mons, Everest als "speed bump" */
export const Mars: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const reveal = beat("reveal");
  const everest = beat("everest");
  const shot = shotIndex(frame, [reveal, everest]);
  const set = (
    <>
      <Sky top="#FF8A65" bottom="#FFE0B2" />
      <Lights sun={[6, 10, 4]} intensity={2.6} sky="#FFCCBC" ground="#8D2B0B" />
      <Ground color="#D2582A" spots="#A63A0F" size={200} />
      {[
        [-6, 0.3, -6],
        [5, 0.4, -8],
        [7, 0.3, 2],
        [-7, 0.35, 1],
      ].map((p, i) => (
        <Rock
          key={i}
          position={p as [number, number, number]}
          size={0.6 + i * 0.2}
          color="#8D3A1A"
        />
      ))}
    </>
  );
  if (shot === 0) {
    const z = lerp(-5, -1, ease(frame, 0, reveal));
    return (
      <>
        {set}
        <Milo
          frame={frame}
          position={[0, 0, z]}
          walk={1}
          eyes="dot"
          mouth="smile"
          arms={[0.35, 0.35]}
        />
        <BlobShadow position={[0, 0, z]} />
        <Shot
          frame={frame}
          duration={reveal}
          from={[0.6, 2.6, 4.2]}
          to={[0.4, 2.8, 6.4]}
          look={[0, 2.6, z - 1]}
          fov={44}
        />
      </>
    );
  }
  const volcano = (
    <group position={[0, 0, -36]}>
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 22, 12, 48]} />
        <Toon color="#B5471E" />
        <Ink f={0.012}>
          <cylinderGeometry args={[4, 22, 12, 48]} />
        </Ink>
      </mesh>
      <mesh position={[0, 12.02, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 32]} />
        <meshBasicMaterial color="#3E1408" />
      </mesh>
    </group>
  );
  if (shot === 1) {
    const f = frame - reveal;
    return (
      <>
        {set}
        {volcano}
        <Burst
          frame={frame}
          start={reveal}
          origin={[0, 12, -36]}
          count={14}
          speed={0.25}
          gravity={-0.004}
          size={2.2}
          colors={["#ECEFF1", "#B0BEC5"]}
          seed={8}
          shape="rock"
        />
        <Milo
          frame={frame}
          position={[0, 0, 0]}
          rotation={[0, Math.PI, 0]}
          arms={[0.6, 0.6]}
        />
        <BlobShadow position={[0, 0, 0]} />
        <Shot
          frame={f}
          duration={everest - reveal}
          from={[1, 1.6, 6]}
          to={[1.5, 7, 14]}
          look={[0, 3, -20]}
          lookTo={[0, 7, -36]}
          fov={48}
          shake={0.08}
        />
      </>
    );
  }
  const f = frame - everest;
  return (
    <>
      {set}
      {volcano}
      {/* Mini-Everest mit Schneekappe und Fähnchen */}
      <group position={[1.3, 0, 1]}>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.45, 0.6, 7]} />
          <Toon color="#78909C" />
          <Ink f={0.028}>
            <coneGeometry args={[0.45, 0.6, 7]} />
          </Ink>
        </mesh>
        <mesh position={[0, 0.53, 0]}>
          <coneGeometry args={[0.16, 0.16, 7]} />
          <Toon color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.25, 4]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[0.06, 0.8, 0]}>
          <planeGeometry args={[0.12, 0.08]} />
          <meshBasicMaterial color="#E53935" />
        </mesh>
      </group>
      <Milo
        frame={frame}
        position={[0, 0, 0]}
        rotation={[0, 0.5, 0]}
        eyes="happy"
        mouth="grin"
        bounce={0.12}
        arms={[0.5, 1.2]}
      />
      <BlobShadow position={[0, 0, 0]} />
      <Shot
        frame={f}
        duration={duration - everest}
        from={[3.4, 1.6, 4.4]}
        to={[2.8, 1.4, 3.6]}
        look={[0.9, 1.2, 0.4]}
        fov={46}
      />
    </>
  );
};

/* 8 — Jupiter: ~1.000 Erden passen hinein */
export const Jupiter: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const fill = beat("fill");
  const earths = useMemo(() => {
    const r = seeded(14);
    return Array.from({ length: 80 }, (_, i) => {
      const a = r() * Math.PI * 2;
      return {
        x: Math.cos(a) * 3.6,
        y: (Math.sin(a) > 0 ? 1 : -1) * (6.5 + r() * 2.5),
        delay: i * 0.55,
      };
    });
  }, []);
  if (shotIndex(frame, [fill]) === 0) {
    return (
      <>
        <Space />
        <Lights sun={[-8, 4, 8]} intensity={2.4} />
        <Planet
          kind="jupiter"
          radius={8}
          position={[0, 0, -6]}
          spin={frame * 0.008}
        />
        <Rocket
          frame={frame}
          position={[lerp(-8, 8, frame / Math.max(1, fill)), -5.5, 7]}
          rotation={[0, 0, -Math.PI / 2]}
          scale={0.2}
          flame={1}
        />
        <Shot
          frame={frame}
          duration={fill}
          from={[0, 0, 24]}
          to={[0, -1, 20]}
          look={[0, -1, 0]}
          fov={46}
        />
      </>
    );
  }
  const f = frame - fill;
  return (
    <>
      <Space />
      <Lights sun={[-8, 4, 8]} intensity={2.4} />
      <Planet kind="jupiter" radius={5} spin={frame * 0.008} />
      {earths.map((e, i) => {
        const t = (f - e.delay) / 30;
        if (t < 0 || t > 1) return null;
        const k = Easing.in(Easing.quad)(t);
        return (
          <Planet
            key={i}
            kind="earth"
            radius={0.45}
            position={[lerp(e.x, 0, k), lerp(e.y, 0, k), lerp(6, 0, k)]}
            spin={frame * 0.05}
          />
        );
      })}
      <Shot
        frame={f}
        duration={duration - fill}
        from={[0, 2, 19]}
        to={[0, 1.5, 15]}
        look={[0, 0, 0]}
        fov={46}
      />
    </>
  );
};

/* 9 — Saturn: Ringe aus Eis- und Gesteinsbrocken */
export const Saturn: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const zoom = beat("zoom");
  const house = beat("house");
  const shot = shotIndex(frame, [zoom, house]);
  const chunks = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: 90 }, () => ({
      p: [(r() - 0.5) * 30, (r() - 0.5) * 2, -r() * 40 + 6] as [
        number,
        number,
        number,
      ],
      s: 0.15 + r() * 0.7,
      c: ["#ECEFF1", "#CFD8DC", "#B3E5FC", "#A1887F"][Math.floor(r() * 4)],
      rot: r() * 3,
    }));
  }, []);
  if (shot === 0) {
    const a = frame * 0.004;
    return (
      <>
        <Space />
        <Lights sun={[-8, 5, 8]} intensity={2.4} />
        <Planet kind="saturn" radius={3} tilt={0.35} spin={frame * 0.01} />
        <Shot
          frame={frame}
          duration={zoom}
          from={[Math.sin(a) * 13, 2.5, Math.cos(a) * 13]}
          to={[Math.sin(a) * 11, 1.2, Math.cos(a) * 11]}
          look={[0, 0, 0]}
          fov={45}
        />
      </>
    );
  }
  const field = chunks.map((c, i) => (
    <mesh
      key={i}
      position={c.p}
      rotation={[c.rot + frame * 0.01, c.rot, 0]}
      scale={c.s}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <Toon color={c.c} />
      <Ink f={0.08}>
        <dodecahedronGeometry args={[1, 0]} />
      </Ink>
    </mesh>
  ));
  if (shot === 1) {
    const f = frame - zoom;
    const z = -f * 0.08;
    return (
      <>
        <Space top="#0D1B3E" bottom="#2A3F6B" />
        <Lights sun={[-6, 8, 6]} intensity={2.4} />
        {field}
        <group position={[0, 0, z]}>
          <mesh position={[0, -0.3, 0]} scale={[1.6, 0.5, 1.2]}>
            <dodecahedronGeometry args={[1, 0]} />
            <Toon color="#B3E5FC" />
            <Ink f={0.07}>
              <dodecahedronGeometry args={[1, 0]} />
            </Ink>
          </mesh>
          <Milo
            frame={frame}
            position={[0, 0.15, 0]}
            rotation={[0, 0.6, Math.sin(frame * 0.15) * 0.12]}
            eyes="happy"
            mouth="grin"
            arms={[1.4, 1.4]}
          />
        </group>
        <Shot
          frame={f}
          duration={house - zoom}
          from={[3, 2.6, 8 + z]}
          to={[2.4, 2.2, 6.5 + z]}
          look={[0, 2, z]}
          fov={46}
          shake={0.07}
        />
      </>
    );
  }
  const f = frame - house;
  return (
    <>
      <Space top="#0D1B3E" bottom="#2A3F6B" />
      <Lights sun={[-6, 8, 6]} intensity={2.4} />
      {field}
      <mesh position={[-1.4, 0, 0]} scale={[2.6, 1.6, 2]}>
        <dodecahedronGeometry args={[1, 0]} />
        <Toon color="#ECEFF1" />
        <Ink f={0.056}>
          <dodecahedronGeometry args={[1, 0]} />
        </Ink>
      </mesh>
      <House position={[1.9, -0.9, 0.3]} scale={1.1} />
      <Burst
        frame={frame}
        start={house}
        origin={[-1.4, 0, 0]}
        count={20}
        speed={0.14}
        gravity={0}
        size={0.3}
        colors={["#ECEFF1", "#B3E5FC"]}
        seed={3}
        shape="rock"
      />
      <Shot
        frame={f}
        duration={duration - house}
        from={[0, 1.6, 9]}
        to={[0.3, 1.2, 7.4]}
        look={[0, 0, 0]}
        fov={46}
        punch={0}
      />
    </>
  );
};

/* 10 — Uranus: ~98° gekippt, "rollt" um die Sonne */
export const Uranus: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const roll = beat("roll");
  const tilt = (97.77 * Math.PI) / 180; // NASA: 97.77°
  if (shotIndex(frame, [roll]) === 0) {
    return (
      <>
        <Space />
        <Lights sun={[-8, 4, 8]} intensity={2.4} />
        <Planet
          kind="uranus"
          radius={2.3}
          position={[1.6, 4.8, -4]}
          tilt={tilt}
          spin={frame * 0.03}
        />
        <group
          position={[-0.9, 2.2, 0]}
          rotation={[0, 0.3, ease(frame, 10, 40) * -1.1]}
        >
          <Milo
            frame={frame}
            position={[0, -2.2, 0]}
            eyes="dot"
            mouth="flat"
            brow={0.1}
            arms={[0.3, 0.3]}
          />
        </group>
        <Shot
          frame={frame}
          duration={roll}
          from={[0, 3.2, 14]}
          to={[0, 3.2, 12.5]}
          look={[0, 3, 0]}
          fov={46}
        />
      </>
    );
  }
  const f = frame - roll;
  const a = f * 0.035;
  return (
    <>
      <Space />
      <Lights sun={[0, 6, 0]} intensity={1.6} />
      <pointLight position={[0, 0, 0]} intensity={80} color="#FFE082" />
      <Planet kind="sun" radius={1.6} spin={frame * 0.01} />
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.46, 1, 1]}>
        <torusGeometry args={[7, 0.03, 8, 128]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
      </mesh>
      <group
        position={[Math.cos(a) * 3.2, 0, Math.sin(a) * 7]}
        rotation={[0, -a, 0]}
      >
        <group rotation={[0, 0, tilt]}>
          <group rotation={[0, f * 0.25, 0]}>
            <Planet kind="uranus" radius={1.3} />
          </group>
        </group>
      </group>
      <Shot
        frame={f}
        duration={duration - roll}
        from={[0, 21, 6]}
        to={[0, 18, 5]}
        look={[0, 0, 0]}
        fov={46}
      />
    </>
  );
};

/* 11 — Neptun: Wind > 2.000 km/h, Jahr = 165 Erdjahre */
export const Neptune: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const wind = beat("wind");
  const c2 = Math.round(lerp(wind, duration, 0.5));
  const shot = shotIndex(frame, [wind, c2]);
  if (shot === 0) {
    return (
      <>
        <Space />
        <Lights sun={[-8, 4, 8]} intensity={2.2} />
        <Planet kind="neptune" radius={4} spin={frame * 0.02} />
        <Shot
          frame={frame}
          duration={wind}
          from={[0, 0.5, 16]}
          to={[0, 0.3, 11]}
          look={[0, 0, 0]}
          fov={45}
        />
      </>
    );
  }
  const backdrop = (
    <>
      <Space top="#06143A" bottom="#1C3F94" />
      <Lights sun={[-6, 6, 8]} intensity={2.2} sky="#90CAF9" ground="#0D47A1" />
      <Planet
        kind="neptune"
        radius={11}
        position={[0, -12, -22]}
        spin={frame * 0.02}
      />
    </>
  );
  if (shot === 1) {
    const f = frame - wind;
    const x = lerp(-7, 7, ease(f, 0, c2 - wind, Easing.inOut(Easing.quad)));
    return (
      <>
        {backdrop}
        <SpeedLines frame={frame} area={[34, 14, 8]} speed={1.4} />
        <Milo
          frame={frame}
          position={[x, 0.6 + Math.sin(f * 0.3) * 0.4, 0]}
          rotation={[0, 0, -f * 0.12]}
          eyes="wide"
          mouth="o"
          arms={[2.4, 2.1]}
        />
        <Shot
          frame={f}
          duration={c2 - wind}
          from={[0, 2.6, 12]}
          look={[x * 0.3, 2.2, 0]}
          fov={48}
          shake={0.14}
        />
      </>
    );
  }
  const f = frame - c2;
  return (
    <>
      {backdrop}
      <SpeedLines frame={frame} area={[30, 12, 8]} speed={1.2} />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 40]} />
        <Toon color="#5C6BC0" />
        <Ink f={0.042}>
          <circleGeometry args={[3, 40]} />
        </Ink>
      </mesh>
      <Milo
        frame={frame}
        position={[-0.7, 0, 0]}
        rotation={[0, 0.3, 0]}
        eyes="dot"
        mouth="frown"
        brow={-0.35}
        arms={[0.15, 0.15]}
      />
      <Cake frame={frame} position={[0.9, 0, 0.8]} lit={false} />
      <Shot
        frame={f}
        duration={duration - c2}
        from={[0.5, 2.6, 6.8]}
        to={[0.4, 2.4, 5.6]}
        look={[0, 2, 0]}
        fov={44}
      />
    </>
  );
};

/* 12 — Outro: Milo gewinnt, alle Planeten, Loop zurück zur Venus */
export const Outro: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const win = beat("win");
  const lineup = beat("lineup");
  const loop = beat("loop");
  const shot = shotIndex(frame, [lineup, loop]);
  if (shot === 0) {
    return (
      <>
        <color attach="background" args={["#90A4AE"]} />
        <Lights sun={[6, 10, 7]} />
        <Ground color="#B0BEC5" tiles size={40} />
        <Office />
        <Boss
          frame={frame}
          position={[1.2, 0, -2.2]}
          eyes="wide"
          mouth="o"
          brow={-0.3}
          arms={[0.5, 0.5]}
        />
        <Milo
          frame={frame}
          position={[-1.4, 0, 0.2]}
          rotation={[0, 0.4, 0]}
          sunglasses
          mouth="grin"
          bounce={0.1}
          arms={[1.8, 0.3]}
        />
        <BlobShadow position={[-1.4, 0, 0.2]} />
        <Confetti frame={frame} start={Math.max(0, win)} origin={[0, 8, 0]} />
        <Shot
          frame={frame}
          duration={lineup}
          from={[0, 3.4, 9]}
          to={[0, 3.2, 7.6]}
          look={[0, 2.8, -0.8]}
          fov={44}
        />
      </>
    );
  }
  if (shot === 1) {
    const f = frame - lineup;
    const row: [PlanetKind, number, number][] = [
      ["sun", -16, 4],
      ["mercury", -9.5, 0.4],
      ["venus", -7.6, 0.75],
      ["earth", -5.4, 0.8],
      ["mars", -3.4, 0.55],
      ["jupiter", 0, 2.2],
      ["saturn", 5.2, 1.8],
      ["uranus", 9.6, 1.1],
      ["neptune", 12.6, 1.05],
    ];
    const x = lerp(-9, 9, ease(f, 0, loop - lineup, Easing.inOut(Easing.sin)));
    return (
      <>
        <Space />
        <Lights sun={[-10, 4, 10]} intensity={2.4} />
        {row.map(([k, px, r]) => (
          <Planet
            key={k}
            kind={k}
            radius={r}
            position={[px, 0, 0]}
            spin={frame * 0.01}
            tilt={k === "uranus" ? 1.71 : k === "saturn" ? 0.35 : 0}
          />
        ))}
        <Shot
          frame={f}
          duration={loop - lineup}
          from={[x - 2, 1.4, 11]}
          look={[x, 0, 0]}
          fov={46}
        />
      </>
    );
  }
  // Loop: gleiche Einstellung wie der Anfang (Venus, Push-in) -> nahtloser Übergang zum Start
  const f = frame - loop;
  return (
    <>
      <Space />
      <Lights sun={[-6, 4, 8]} intensity={2.4} sky="#FFE0B2" ground="#311B92" />
      <Planet kind="venus" radius={3} spin={frame * 0.01} />
      <Shot
        frame={f}
        duration={duration - loop}
        from={[0, 0.4, 19]}
        to={[0, 0.3, 14]}
        look={[0, 0, 0]}
        fov={42}
      />
    </>
  );
};
