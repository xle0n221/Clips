import React from "react";
import { Easing } from "remotion";
import { Shot } from "../kit/camera";
import { Ground, Rock, Sky, Space } from "../kit/env";
import { Burst, Confetti, Glow } from "../kit/fx";
import { Planet } from "../kit/planets";
import {
  BlobShadow,
  Board,
  Cake,
  Lights,
  Office,
  Rocket,
  Thermometer,
} from "../kit/props";
import { Boss, Milo, Toonie } from "../kit/Toonie";
import { Ink, Toon } from "../kit/toon";
import { shotIndex, useScene } from "../types";
import { ease, lerp } from "./util";

/* 1 — Hook: Venus + der Boss lacht Milo aus */
export const Hook: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const office = beat("office");
  const laugh = beat("laugh");
  if (shotIndex(frame, [office]) === 0) {
    return (
      <>
        <Space />
        <Lights
          sun={[-6, 4, 8]}
          intensity={2.4}
          sky="#FFE0B2"
          ground="#311B92"
        />
        <Planet kind="venus" radius={3} spin={frame * 0.01} />
        <Shot
          frame={frame}
          duration={office}
          from={[0, 0.3, 14]}
          to={[0, 0.2, 8.6]}
          look={[0, 0, 0]}
          fov={42}
        />
      </>
    );
  }
  const f = frame - office;
  const laughing = frame >= laugh;
  return (
    <>
      <color attach="background" args={["#90A4AE"]} />
      <Lights sun={[6, 10, 7]} />
      <Ground color="#B0BEC5" tiles size={40} />
      <Office />
      <Boss
        frame={frame}
        position={[0, 0, -2.4]}
        eyes={laughing ? "happy" : "dot"}
        mouth={laughing ? "teeth" : "flat"}
        brow={laughing ? 0 : -0.2}
        bounce={laughing ? 0.18 : 0}
        arms={laughing ? [0.9, 0.9] : [0.2, 0.2]}
      />
      <Toonie
        frame={frame + 30}
        position={[1.7, 0, -1.9]}
        rotation={[0, -0.5, 0]}
        suit="#283593"
        cap="#1A237E"
        eyes={laughing ? "happy" : "dot"}
        mouth={laughing ? "grin" : "smile"}
        bounce={laughing ? 0.14 : 0}
      />
      <Milo
        frame={frame}
        position={[-1.0, 0, 2.2]}
        rotation={[0, Math.PI * 0.82, 0]}
        eyes="wide"
        mouth="o"
        arms={[0.25, 1.9]}
      />
      <BlobShadow position={[-1.0, 0, 2.2]} />
      <BlobShadow position={[1.7, 0, -1.9]} />
      <Shot
        frame={f}
        duration={duration - office}
        from={[0.7, 4.4, 10.5]}
        to={[0.5, 4.1, 9]}
        look={[0, 2.8, -0.6]}
        fov={40}
        punch={laugh - office}
      />
    </>
  );
};

/* 2 — Wait, what? Zahlen an der Tafel, die Wette, Start der Rakete */
export const Launch: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const c1 = Math.round(duration * 0.2);
  const bet = beat("bet");
  const launch = beat("launch");
  const shot = shotIndex(frame, [c1, bet, launch]);

  if (shot < 3) {
    const officeSet = (
      <>
        <color attach="background" args={["#90A4AE"]} />
        <Lights sun={[6, 10, 7]} />
        <Ground color="#B0BEC5" tiles size={40} />
        <Office />
        <Board
          lines={["1 DAY = 243", "1 YEAR = 225"]}
          position={[-3.2, 4.4, -3.7]}
          size={[4.2, 2.6]}
        />
      </>
    );
    if (shot === 0) {
      return (
        <>
          {officeSet}
          <Boss
            frame={frame}
            position={[0, 0, -2.4]}
            eyes="wide"
            mouth="o"
            brow={-0.3}
            arms={[0.5, 0.5]}
          />
          <Shot
            frame={frame}
            duration={c1}
            from={[0, 3.3, 3.2]}
            to={[0, 3.2, 1.6]}
            look={[0, 3.1, -2.4]}
            fov={38}
            shake={0.03}
          />
        </>
      );
    }
    if (shot === 1) {
      const f = frame - c1;
      return (
        <>
          {officeSet}
          <Milo
            frame={frame}
            position={[-0.6, 0, -1.6]}
            rotation={[0, -0.35, 0]}
            eyes="dot"
            mouth="grin"
            brow={0.15}
            arms={[0.25, 2.2]}
            sunglasses={false}
          />
          <BlobShadow position={[-0.6, 0, -1.6]} />
          <Shot
            frame={f}
            duration={bet - c1}
            from={[1.6, 3.6, 6.5]}
            to={[0.8, 3.7, 5]}
            look={[-1.8, 3.6, -2.6]}
            fov={44}
          />
        </>
      );
    }
    const f = frame - bet;
    return (
      <>
        {officeSet}
        <Milo
          frame={frame}
          position={[-1.2, 0, 0]}
          rotation={[0, 0.9, 0]}
          eyes="angry"
          mouth="grin"
          arms={[0.2, 1.5]}
        />
        <Boss
          frame={frame}
          position={[1.4, 0, -0.4]}
          rotation={[0, -0.9, 0]}
          eyes="dot"
          mouth="smile"
          brow={0.25}
          arms={[0.6, 0.6]}
        />
        <BlobShadow position={[-1.2, 0, 0]} />
        <BlobShadow position={[1.4, 0, -0.4]} />
        {/* Untersicht = Spannung */}
        <Shot
          frame={f}
          duration={launch - bet}
          from={[0, 0.8, 6.5]}
          to={[0.4, 1, 5.6]}
          look={[0, 3.4, -0.2]}
          fov={50}
          punch={0}
        />
      </>
    );
  }
  const f = frame - launch;
  const lift = ease(f, 12, duration - launch, Easing.in(Easing.quad));
  const y = lift * 40;
  return (
    <>
      <Sky top="#1E88E5" bottom="#BBDEFB" />
      <Lights sun={[8, 12, 6]} />
      <Ground color="#7CB342" spots="#689F38" size={160} />
      {/* Startrampe */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.3, 32]} />
        <Toon color="#9E9E9E" />
        <Ink f={0.042}>
          <cylinderGeometry args={[3, 3.2, 0.3, 32]} />
        </Ink>
      </mesh>
      <Rocket frame={frame} position={[0, 0.3 + y, 0]} flame={ease(f, 0, 10)} />
      <Burst
        frame={frame}
        start={launch + 8}
        origin={[0, 0.5, 0]}
        count={40}
        speed={0.16}
        gravity={-0.001}
        size={0.9}
        colors={["#ECEFF1", "#CFD8DC", "#FFFFFF"]}
        seed={4}
        shape="rock"
      />
      <Shot
        frame={f}
        duration={duration - launch}
        from={[5, 1.2, 11]}
        to={[3, 2 + y * 0.6, 14]}
        look={[0, 3, 0]}
        lookTo={[0, 4 + y, 0]}
        fov={46}
        shake={0.08}
      />
    </>
  );
};

/* 3 — Die Sonne */
export const Sun: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const c1 = Math.round(duration * 0.32);
  const crumbs = beat("crumbs");
  const shot = shotIndex(frame, [c1, crumbs]);
  if (shot === 0) {
    return (
      <>
        <Space top="#1A0B2E" bottom="#4A1C1C" />
        <Lights
          sun={[0, 0, -10]}
          intensity={2}
          color="#FFE082"
          sky="#FFB74D"
          ground="#1A0B2E"
        />
        <Planet
          kind="sun"
          radius={14}
          position={[0, 0, -70]}
          spin={frame * 0.004}
        />
        <Rocket
          frame={frame}
          position={[0, 0, -frame * 0.04]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.6}
          flame={1}
        />
        <Shot
          frame={frame}
          duration={c1}
          from={[2.2, 1.6, 9]}
          to={[1.4, 1.1, 6]}
          look={[0, 0, -20]}
          fov={50}
        />
      </>
    );
  }
  if (shot === 1) {
    const f = frame - c1;
    return (
      <>
        <Space top="#1A0B2E" bottom="#4A1C1C" />
        <Lights
          sun={[3, 5, 9]}
          intensity={2.4}
          color="#FFE082"
          ambient={1.2}
          sky="#FFCC80"
          ground="#3E2723"
        />
        <Planet
          kind="sun"
          radius={16}
          position={[0, 1, -48]}
          spin={frame * 0.004}
        />
        <Milo
          frame={frame}
          position={[0, -0.4 + Math.sin(frame * 0.08) * 0.15, 0]}
          rotation={[0, 0.25, Math.sin(frame * 0.05) * 0.06]}
          sunglasses
          sweat
          mouth="flat"
          arms={[0.9, 0.7]}
        />
        <Shot
          frame={f}
          duration={crumbs - c1}
          from={[0.4, 2.9, 7.5]}
          to={[0.2, 2.9, 5.8]}
          look={[0, 2.6, 0]}
          fov={42}
        />
      </>
    );
  }
  const f = frame - crumbs;
  return (
    <>
      <Space top="#1A0B2E" bottom="#4A1C1C" />
      <Lights sun={[-4, 2, 8]} intensity={2} />
      <Planet
        kind="sun"
        radius={4.6}
        position={[0, 3.4, 0]}
        spin={frame * 0.004}
      />
      {(
        ["mercury", "venus", "earth", "mars", "jupiter", "saturn"] as const
      ).map((k, i) => (
        <Planet
          key={k}
          kind={k}
          radius={0.18 + (k === "jupiter" || k === "saturn" ? 0.22 : 0.06)}
          position={[
            -2.3 + i * 0.92,
            -2.4 - f * 0.05 * (1 + i * 0.15),
            1.5 + Math.sin(i) * 0.6,
          ]}
          spin={frame * 0.05}
        />
      ))}
      <Shot
        frame={f}
        duration={duration - crumbs}
        from={[0, 0, 21]}
        to={[0, -0.4, 18]}
        look={[0, -0.4, 0]}
        fov={45}
        punch={0}
      />
    </>
  );
};

/* 4 — Merkur: 88-Tage-Jahr, Geburtstagsparty */
export const Mercury: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const party = beat("party");
  if (shotIndex(frame, [party]) === 0) {
    const a = frame * 0.11;
    return (
      <>
        <Space />
        <Lights sun={[0, 10, 0]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} intensity={60} color="#FFE082" />
        <Planet kind="sun" radius={2} spin={frame * 0.01} />
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.5, 1, 1]}>
          <torusGeometry args={[6, 0.035, 8, 128]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <mesh
            key={k}
            position={[
              Math.cos(a - k * 0.09) * 3,
              0,
              Math.sin(a - k * 0.09) * 6,
            ]}
          >
            <sphereGeometry args={[0.45 - k * 0.06, 12, 8]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.35 - k * 0.05}
            />
          </mesh>
        ))}
        <Planet
          kind="mercury"
          radius={0.6}
          position={[Math.cos(a) * 3, 0, Math.sin(a) * 6]}
          spin={frame * 0.05}
        />
        <Shot
          frame={frame}
          duration={party}
          from={[0, 17, 5]}
          to={[0, 15, 4]}
          look={[0, 0, 0]}
          fov={45}
        />
      </>
    );
  }
  const f = frame - party;
  return (
    <>
      <Space />
      <Lights sun={[-6, 8, 6]} intensity={2.8} />
      <Ground color="#9E9E9E" spots="#757575" size={60} />
      {[
        [-4, 0.2, -3],
        [3.5, 0.3, -4],
        [5, 0.2, 1],
        [-5, 0.25, 1.5],
      ].map((p, i) => (
        <Rock
          key={i}
          position={p as [number, number, number]}
          size={0.5 + i * 0.15}
          color="#8D8D8D"
        />
      ))}
      <Milo
        frame={frame}
        position={[0, 0, 0]}
        partyHat
        eyes="happy"
        mouth="grin"
        blush
        bounce={0.22}
        arms={[1.9, 1.9]}
      />
      <BlobShadow position={[0, 0, 0]} />
      <Cake frame={frame} position={[1.6, 0, 1.2]} />
      <Confetti frame={frame} start={party} origin={[0, 7, 0]} />
      <Shot
        frame={f}
        duration={duration - party}
        from={[0.5, 2.6, 8.5]}
        to={[0.4, 2.8, 6.8]}
        look={[0.3, 2.4, 0]}
        fov={44}
      />
    </>
  );
};

/* 5 — Venus: heißester Planet, Blei schmilzt, Sonnenaufgang im Westen */
export const Venus: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const melt = beat("melt");
  const sunrise = beat("sunrise");
  const shot = shotIndex(frame, [melt, sunrise]);
  const set = (cracks: number) => (
    <>
      <Sky top="#E65100" bottom="#FFCC80" />
      <Lights
        sun={[4, 9, 6]}
        intensity={2.4}
        color="#FFE0B2"
        sky="#FFB74D"
        ground="#BF360C"
      />
      <Ground color="#E0913A" spots="#C06A20" cracks={cracks} size={90} />
      {[
        [-5, 0.3, -4],
        [4.5, 0.4, -5],
        [6, 0.3, 0],
        [-6.5, 0.35, 0.5],
      ].map((p, i) => (
        <Rock
          key={i}
          position={p as [number, number, number]}
          size={0.7 + i * 0.2}
          color="#A1592A"
        />
      ))}
    </>
  );
  if (shot === 0) {
    const level = ease(frame, 10, melt - 10);
    return (
      <>
        {set(0.35 + 0.5 * level + Math.sin(frame * 0.3) * 0.08)}
        <Milo
          frame={frame}
          position={[-1, 0, 0]}
          sweat
          eyes={level > 0.6 ? "glow" : "wide"}
          mouth={level > 0.6 ? "teeth" : "o"}
          arms={[1.2, 1.2]}
        />
        <BlobShadow position={[-1, 0, 0]} />
        <Thermometer
          level={level * 1.05}
          position={[2.2, 0, 0.6]}
          scale={1.15}
        />
        <Glow
          position={[2.2, 4.6, 0.6]}
          radius={0.5}
          color="#FF3D00"
          intensity={level}
        />
        <Burst
          frame={frame}
          start={melt - 12}
          origin={[2.2, 4.6, 0.6]}
          count={18}
          speed={0.2}
          size={0.25}
          colors={["#FF1744", "#FFFFFF", "#FF8A80"]}
        />
        <Shot
          frame={frame}
          duration={melt}
          from={[0, 3.4, 11]}
          to={[0.3, 3.1, 7.6]}
          look={[0.4, 2.6, 0]}
          fov={44}
          shake={0.06}
        />
      </>
    );
  }
  if (shot === 1) {
    const f = frame - melt;
    const m = ease(f, 6, (sunrise - melt) * 0.6);
    return (
      <>
        {set(0.7)}
        <Milo
          frame={frame}
          position={[-1.6, 0, -2.6]}
          rotation={[0, 0.4, 0]}
          eyes="wide"
          mouth="o"
          sweat
          arms={[1.6, 1.6]}
        />
        <Burst
          frame={frame}
          start={melt + 10}
          origin={[0, 0.5, 0]}
          count={16}
          speed={0.12}
          size={0.14}
          colors={["#CFD8DC", "#FF6D00"]}
          seed={6}
        />
        <mesh
          position={[0, 0.5 * lerp(1, 0.18, m), 0]}
          scale={[lerp(1, 1.9, m), lerp(1, 0.18, m), lerp(1, 1.9, m)]}
          castShadow
        >
          <boxGeometry args={[1.4, 1, 0.8]} />
          <Toon color="#90A4AE" />
          <Ink f={0.042}>
            <boxGeometry args={[1.4, 1, 0.8]} />
          </Ink>
        </mesh>
        <mesh
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.4 + m * 1.6}
        >
          <circleGeometry args={[1, 32]} />
          <Toon color="#B0BEC5" />
        </mesh>
        <Glow
          position={[0, 0.1, 0]}
          radius={0.35}
          color="#FF6D00"
          intensity={0.3}
        />
        <Shot
          frame={f}
          duration={sunrise - melt}
          from={[0.6, 2.8, 7.8]}
          to={[0.4, 2.4, 6.4]}
          look={[-0.4, 1.3, -0.8]}
          fov={46}
        />
      </>
    );
  }
  const f = frame - sunrise;
  const rise = ease(f, 0, duration - sunrise, Easing.out(Easing.cubic));
  return (
    <>
      {set(0.5)}
      <Planet
        kind="sun"
        radius={1.6}
        position={[-9, lerp(-1.5, 3.2, rise), -14]}
        spin={frame * 0.01}
      />
      <Board
        lines={["W"]}
        position={[-3.5, 1.6, -2]}
        size={[1, 0.8]}
        bg="#FFF8E1"
        ink="#BF360C"
      />
      <Board
        lines={["E"]}
        position={[3.5, 1.6, -2]}
        size={[1, 0.8]}
        bg="#FFF8E1"
        ink="#BF360C"
      />
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.6, -2.08]}>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 6]} />
          <Toon color="#5D4037" />
        </mesh>
      ))}
      <Milo
        frame={frame}
        position={[0, 0, 0]}
        look={-0.9}
        eyes="wide"
        mouth="o"
        brow={-0.3}
        arms={[0.2, 2.4]}
      />
      <BlobShadow position={[0, 0, 0]} />
      <Shot
        frame={f}
        duration={duration - sunrise}
        from={[0.5, 2.8, 12]}
        to={[0.2, 3, 10]}
        look={[-1, 2.8, 0]}
        fov={46}
      />
    </>
  );
};

/* 6 — Erde: 150 Mio. km, Licht braucht ~8 Minuten */
export const Earth: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const beamAt = beat("beam");
  const c2 = Math.round(lerp(beamAt, duration, 0.6));
  const shot = shotIndex(frame, [beamAt, c2]);
  if (shot === 0) {
    return (
      <>
        <Space />
        <Lights sun={[-8, 3, 6]} intensity={2.6} />
        <Planet kind="earth" radius={3} spin={frame * 0.012} tilt={0.4} />
        <Rocket
          frame={frame}
          position={[lerp(-9, 9, frame / Math.max(1, beamAt)), 3.2, 4]}
          rotation={[0, 0, -Math.PI / 2]}
          scale={0.25}
          flame={1}
        />
        <Shot
          frame={frame}
          duration={beamAt}
          from={[0, 0.5, 12]}
          to={[0, 0.4, 10]}
          look={[0, 0, 0]}
          fov={45}
        />
      </>
    );
  }
  if (shot === 1) {
    const f = frame - beamAt;
    return (
      <>
        <Space />
        <Lights sun={[0, 10, 4]} intensity={2.2} />
        <Planet
          kind="sun"
          radius={3.2}
          position={[0, 9, -4]}
          spin={frame * 0.01}
        />
        <Planet
          kind="earth"
          radius={1.3}
          position={[0, -4, 0]}
          spin={frame * 0.02}
          tilt={0.4}
        />
        <BeamLine progress={ease(f, 0, (c2 - beamAt) * 0.9)} />
        <Shot
          frame={f}
          duration={c2 - beamAt}
          from={[0.5, 0, 27]}
          to={[0.3, -0.5, 24]}
          look={[0, 0, 0]}
          fov={45}
        />
      </>
    );
  }
  const f = frame - c2;
  return (
    <>
      <Space />
      <Lights sun={[-6, 3, 6]} intensity={2.4} color="#FFE082" ambient={1.1} />
      <Glow
        position={[-3, 3, -2]}
        radius={1.2}
        color="#FFCA28"
        intensity={0.8}
      />
      <Milo
        frame={frame}
        position={[0, 0, 0]}
        eyes="happy"
        mouth="smile"
        blush
        look={-0.25}
        arms={[0.4, 0.4]}
      />
      <Shot
        frame={f}
        duration={duration - c2}
        from={[0.3, 3.2, 5.2]}
        to={[0.2, 3.1, 4.2]}
        look={[0, 3, 0]}
        fov={40}
      />
    </>
  );
};

const BeamLine: React.FC<{ readonly progress: number }> = ({ progress }) => {
  // Vertikaler Strahl von der Sonne (oben) zur Erde (unten) – passt ins Hochformat
  const from: [number, number, number] = [0, 5.8, -3];
  const to: [number, number, number] = [0, -2.7, 0];
  const p = Math.max(0.001, progress);
  const y = lerp(from[1], to[1], p);
  const z = lerp(from[2], to[2], p);
  const len = Math.hypot(y - from[1], z - from[2]);
  const angle = Math.atan2(to[2] - from[2], to[1] - from[1]);
  return (
    <group>
      <mesh
        position={[0, (from[1] + y) / 2, (from[2] + z) / 2]}
        rotation={[angle, 0, 0]}
      >
        <cylinderGeometry args={[0.16, 0.16, len, 10]} />
        <meshBasicMaterial color="#FFF59D" />
      </mesh>
      <Glow
        position={[0, y, z]}
        radius={0.45}
        color="#FFEE58"
        intensity={1.2}
      />
    </group>
  );
};
