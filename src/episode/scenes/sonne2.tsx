/**
 * „What If the Sun Vanished? The First 8:19“ – Szenen 12–23 (rehook … answer2).
 * Shot-Liste: episodes/sonne-verschwindet.json (scenes[].shots) + docs/paket-sonne-verschwindet.md; Schnitte: sonneCuts.ts.
 */
import { RoundedBox } from "@react-three/drei";
import React from "react";
import { Shot, V3 } from "../kit/camera";
import { eyePopAt } from "../kit/motion";
import { earthOnOrbit, HookFrame, hudAt, JUNO_LIE, JUNO_SIT, ORBIT_R, useShots } from "./sonne1";
import {
  atScreen,
  BalconySet,
  BeachSet,
  clockText,
  DotLine,
  EarthBall,
  EYEPIECE,
  EyepieceView,
  faceTo,
  fly,
  frameOn,
  Halo,
  HudPanel,
  IceSheet,
  Juno,
  junoHead,
  lerp,
  LightShaft,
  Motes,
  Ode,
  ODE_SCOPE,
  odeScopeHead,
  OrbitDots,
  Phone,
  Plastic,
  ramp,
  S,
  SeaFloor,
  SkyDome,
  SpaceSet,
  Stars,
  SunDisc,
  TextLabel,
  Vent,
} from "./sonneSets";

/** Kleine Musiknote (Geometrie, kein Schriftzeichen – Kit-Schrift hat kein ♪). */
const Note: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly opacity?: number; readonly scale?: number }> = ({ position, rotation = [0, 0, 0], opacity = 1, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <circleGeometry args={[0.12, 16]} />
      <meshBasicMaterial color={S.goldHot} transparent opacity={opacity} toneMapped={false} side={2} />
    </mesh>
    <mesh position={[0.1, 0.24, 0]}>
      <planeGeometry args={[0.035, 0.5]} />
      <meshBasicMaterial color={S.goldHot} transparent opacity={opacity} toneMapped={false} side={2} />
    </mesh>
    <mesh position={[0.18, 0.44, 0]} rotation={[0, 0, -0.5]}>
      <planeGeometry args={[0.2, 0.05]} />
      <meshBasicMaterial color={S.goldHot} transparent opacity={opacity} toneMapped={false} side={2} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ */
/* 12 rehook – „Juno has no idea. | Neither does anyone. | Not yet.“ */
/* ------------------------------------------------------------------ */
export const SonRehook: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("rehook");
  const head = junoHead(JUNO_LIE, "lie");
  if (shot === 0) {
    // Halbnah: Juno sonnt sich und summt (Mund + Noten), Zeitanzeige 3:00 läuft stumm
    const face: V3 = [head[0], head[1] + 0.3, head[2] + 0.4];
    const a = frameOn(face, 4.6, 0.56, 0.5, [0.75, 0.75, 0.55]);
    const b = frameOn(face, 4.0, 0.56, 0.5, [0.7, 0.78, 0.5]);
    const hud = hudAt(b, 0.5, 0.3, 3.4, 0.6);
    const hum = 0.25 + 0.2 * Math.sin(frame * 0.35);
    return (
      <>
        <BeachSet frame={frame} day={1} gulls />
        <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="closed" mouth="smile" talk={hum} glow={1} spread={[0.5, 0.5]} />
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 18) % 54) / 54;
          return <Note key={i} position={[head[0] + 0.5 + t * 0.8, head[1] + 0.9 + t * 1.2, head[2] + 0.2 - i * 0.2]} rotation={faceTo([0, 1, -1], b.pos)} opacity={Math.sin(t * Math.PI)} scale={0.9} />;
        })}
        <HudPanel value={clockText("rehook", frame, beat)} {...hud} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Totale: Strand voller Leute – Eis, Volleyball, Hund, alles normal im Goldlicht
  const a = frameOn([0, 1.5, -9], 15, 0.5, 0.5, [0.15, 0.25, 1]);
  const b = frameOn([0, 1.5, -9], 13.5, 0.5, 0.52, [0.12, 0.26, 1]);
  return (
    <>
      <BeachSet frame={frame} day={1} crowd gulls />
      <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="closed" mouth="smile" glow={1} />
      {/* Eis in der Hand eines Gastes */}
      <group position={[-4.55, 1.6, -6.7]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 0.45, 12]} />
          <meshStandardMaterial color="#D9A55A" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <Plastic color="#FF9EC0" />
        </mesh>
      </group>
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 13 four – „Four minutes in. | Grandpa zooms in on Saturn's rings. | Still perfect.“ */
/* ------------------------------------------------------------------ */
export const SonFour: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("four");
  if (shot === 0) {
    // Nah: Grandpa mit dem Auge am Okular, lächelt (Zeitanzeige 4:00)
    const h = odeScopeHead();
    const a = frameOn(h, 4.4, 0.5, 0.45, [0.75, -0.08, -1]);
    const b = frameOn(h, 3.9, 0.5, 0.45, [0.7, -0.08, -1]);
    const hud = hudAt(b, 0.5, 0.25, 3.2, 0.5);
    return (
      <>
        <BalconySet frame={frame} />
        <Ode frame={frame} position={ODE_SCOPE.position} rotation={ODE_SCOPE.rotation} lean={ODE_SCOPE.lean} nod={ODE_SCOPE.nod} mouth="grin" eyes="closed" reach={[1.1, 1.0]} />
        <pointLight position={[h[0] + 1.2, h[1] + 0.3, h[2] - 1.6]} color="#FFE3B8" intensity={6} distance={5} decay={2} />
        <HudPanel value={clockText("four", frame, beat)} {...hud} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Okular-POV: Saturns Ringe groß, scharf, hell (WIEDERHOLUNG Schlussbild)
  const z = ramp(frame, beat("eyepieceRings") - 8, beat("eyepieceRings") + 16);
  return (
    <>
      <EyepieceView frame={frame} size={1.0 + 0.45 * z} />
      <Shot frame={f} duration={len} from={[0, 0, 13]} to={[0, 0, 12.6]} look={[0, 0, 0]} fov={40} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 14 five – „Five minutes. | Grandpa yawns goodnight. | Juno begs: "Stay on the line!"“ */
/* ------------------------------------------------------------------ */
export const SonFive: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("five");
  const head = junoHead(JUNO_SIT, "sit");
  const phoneP: V3 = [head[0] + 0.25, head[1] - 0.15, head[2] + 1.1];
  if (shot === 0) {
    // Über die Schulter: auf dem Bildschirm gähnt Grandpa, sein Daumen wandert zum roten Auflegen-Knopf
    const y = beat("grandpaYawns");
    const thumb = ramp(frame, y + 6, y + 40);
    const a = frameOn(phoneP, 2.6, 0.44, 0.45, [-0.85, 0.3, -1]);
    const b = frameOn(phoneP, 2.2, 0.44, 0.45, [-0.8, 0.3, -1]);
    return (
      <>
        <BeachSet frame={frame} day={1} umbrella={false} />
        <Juno frame={frame} position={JUNO_SIT} pose="sit" eyes="dot" mouth="o" reach={[1.2, 1.25]} spread={[0.2, 0.2]} glow={1} />
        <group position={phoneP} rotation={[0.1, Math.PI, 0]}>
          <Phone position={[0, 0, 0]} scale={1.1} mood={frame >= y - 4 ? "yawn" : "wave"} />
          {/* Grandpas Daumen (im Bild) Richtung roter Knopf */}
          <RoundedBox args={[0.12, 0.2, 0.04]} radius={0.03} position={[lerp(0.22, 0.02, thumb), lerp(-0.1, -0.34, thumb), 0.06]} rotation={[0, 0, 0.4]}>
            <Plastic color={S.skin} />
          </RoundedBox>
        </group>
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: Juno sitzt auf, grinst und hält das Telefon ganz nah ans Gesicht (Zeitanzeige 5:00)
  const a = frameOn(head, 3.0, 0.56, 0.56, [0.15, 0.04, 1]);
  const b = frameOn(head, 2.6, 0.56, 0.56, [0.12, 0.05, 1]);
  const hud = hudAt(b, 0.5, 0.24, 2.0, 0.56);
  const beg = ramp(frame, beat("junoHoldsPhone") - 4, beat("junoHoldsPhone") + 10);
  return (
    <>
      <BeachSet frame={frame} day={1} gulls />
      <Juno frame={frame} position={JUNO_SIT} pose="sit" eyes={beg > 0.5 ? "wide" : "dot"} mouth="grin" talk={beg > 0.2 ? 0.3 + 0.3 * Math.abs(Math.sin(frame * 0.4)) : 0} reach={[0.4, 1.35]} spread={[0.3, 0.05]} tilt={-0.12 * beg} glow={1} />
      <group position={[head[0] - 0.62, head[1] - 0.05, head[2] + 0.35]} rotation={[0, -0.9, 0.1]}>
        <Phone scale={0.85} mood="yawn" />
      </group>
      <pointLight position={[0.6, 2.2, 1.6]} color={S.gold} intensity={4} distance={4} decay={2} />
      <HudPanel value={clockText("five", frame, beat)} {...hud} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 15 seven – „Seven minutes. | Juno closes her eyes in the warmth. | One warm minute left.“ */
/* ------------------------------------------------------------------ */
const SIT_LEAN = 0.38;
export const SonSeven: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("seven");
  const head = junoHead(JUNO_SIT, "sit", 1, SIT_LEAN);
  const closed = frame >= beat("junoClosesEyes") + 22;
  if (shot === 0) {
    // Ganz nah, langsame Ranfahrt: Juno schließt die Augen, Goldlicht auf dem Gesicht (der Zuschauer weiß es, sie nicht)
    const a = frameOn(head, 2.6, 0.5, 0.5, [0.1, 0.32, 1]);
    const b = frameOn(head, 1.8, 0.5, 0.5, [0.08, 0.34, 1]);
    return (
      <>
        <BeachSet frame={frame} day={1} umbrella={false} />
        <Juno frame={frame} position={JUNO_SIT} pose="sit" lean={SIT_LEAN} nod={-0.32} eyes={closed ? "closed" : "dot"} mouth="smile" spread={[0.55, 0.55]} reach={[-0.4, -0.4]} glow={1} />
        <pointLight position={[0.7, head[1] + 1.2, head[2] + 1.4]} color={S.gold} intensity={5} distance={4} decay={2} />
        <Motes frame={frame} center={[head[0], head[1] + 0.4, head[2] + 0.8]} size={[2.4, 2, 1.5]} count={50} drift={[0.002, 0.002, 0]} color={S.goldHot} dot={0.035} opacity={0.75} seed={21} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Einschub: Zeitanzeige 7:19 groß, dahinter döst Juno (unscharf)
  const a = frameOn(head, 4.2, 0.62, 0.5, [0.25, 0.3, 1]);
  const b = frameOn(head, 3.8, 0.62, 0.5, [0.22, 0.3, 1]);
  const hud = hudAt(b, 0.5, 0.34, 3.4, 0.74);
  const tick = Math.max(0, Math.cos((frame % 30) / 30 * Math.PI * 2)) ** 8;
  return (
    <>
      <BeachSet frame={frame} day={1} umbrella={false} />
      <Juno frame={frame} position={JUNO_SIT} pose="sit" lean={SIT_LEAN} nod={-0.32} eyes="closed" mouth="smile" spread={[0.55, 0.55]} reach={[-0.4, -0.4]} glow={1} />
      <HudPanel value={clockText("seven", frame, beat)} {...hud} scale={hud.scale * (1 + 0.025 * tick)} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 16 hope – „Eight minutes. | Waves, birds, sunshine. | Maybe it's all fine.“ */
/* ------------------------------------------------------------------ */
export const SonHope: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hope");
  const head = junoHead(JUNO_SIT, "sit", 1, 0.1);
  if (shot === 0) {
    // Totale: goldener Strand, Wellen glitzern, Möwen – alles hell (Musik öffnet sich)
    const a = frameOn([0, 2.5, -8], 14, 0.46, 0.5, [-0.2, 0.18, 1]);
    const b = frameOn([0, 2.5, -8], 12.5, 0.46, 0.48, [-0.16, 0.2, 1]);
    return (
      <>
        <BeachSet frame={frame} day={1} gulls crowd glitter={1} />
        <Juno frame={frame} position={JUNO_SIT} pose="sit" lean={0.1} eyes="closed" mouth="smile" glow={1} spread={[0.4, 0.4]} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: Juno streckt sich, entspanntes Lächeln (Zeitanzeige 8:18)
  const s = ramp(frame, beat("junoStretches") - 18, beat("junoStretches") + 6) * (1 - ramp(f, len - 10, len) * 0.3);
  const a = frameOn(head, 4.0, 0.58, 0.5, [-0.1, 0.06, 1]);
  const b = frameOn(head, 3.6, 0.58, 0.5, [-0.08, 0.06, 1]);
  const hud = hudAt(b, 0.5, 0.24, 2.8, 0.56);
  return (
    <>
      <BeachSet frame={frame} day={1} gulls umbrella={false} />
      <Juno frame={frame} position={JUNO_SIT} pose="sit" lean={0.1} stretch={s} eyes={s > 0.5 ? "happy" : "closed"} mouth={s > 0.5 ? "grin" : "smile"} glow={1} />
      <pointLight position={[0.6, 2.4, 1.5]} color={S.gold} intensity={5} distance={4} decay={2} />
      <HudPanel value={clockText("hope", frame, beat)} {...hud} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 17 turn – „Eight minutes, nineteen seconds. | The sky goes black. | And Earth lets go.“ (einziger Halt) */
/* ------------------------------------------------------------------ */
export const SonTurn: React.FC = () => {
  const { frame, beat, f, len } = useShots("turn");
  const head = junoHead(JUNO_SIT, "sit", 1, SIT_LEAN);
  const bk = beat("noonStars");
  const go = beat("junoEyesOpen");
  // Mittag → Nacht in einem Schlag (3 Bilder) auf „black“
  const day = 1 - ramp(frame, bk - 1, bk + 2, (x) => x);
  const stars = ramp(frame, bk, bk + 8);
  const open = frame >= go - 2;
  const pop = eyePopAt(frame, go - 2, 1.5, 1.2);
  const a = frameOn(head, 5.2, 0.6, 0.5, [0.06, -0.08, 1]);
  const b = frameOn(head, 3.9, 0.6, 0.5, [0.04, -0.06, 1]);
  const hud = hudAt(b, 0.5, 0.25, 3.2, 0.58);
  return (
    <>
      <BeachSet frame={frame} day={day} stars={stars} crowd lookUp={0.5 * stars} glitter={day} umbrella={false} />
      <Juno
        frame={frame}
        position={JUNO_SIT}
        pose="sit"
        lean={SIT_LEAN * (open ? 0.6 : 1)}
        nod={open ? -0.42 : -0.32}
        eyes={open ? "wide" : "closed"}
        eyePop={pop}
        mouth={open ? "o" : "smile"}
        spread={[0.55, 0.55]}
        reach={[-0.4, -0.4]}
        glow={day}
        cold={1 - day}
      />
      {/* Gesichtslicht: golden, dann kaltes Sternenblau */}
      <pointLight position={[0.6, head[1] + 1.2, head[2] + 1.5]} color={day > 0.5 ? S.gold : S.iceBlue} intensity={day > 0.5 ? 5 : 3.5} distance={4} decay={2} />
      <HudPanel value={clockText("turn", frame, beat)} {...hud} alert={1 - day} orbit={frame >= go ? "STRAIGHT" : "CURVED"} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" punch={frame >= bk ? bk : undefined} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 18 straight – „Earth flies off straight. | Thirty kilometers a second.“ */
/* ------------------------------------------------------------------ */
export const SonStraight: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("straight");
  const st = beat("orbitSnaps");
  const a0 = 0.6 + Math.min(frame, st) * 0.006;
  const base: V3 = [Math.cos(a0) * ORBIT_R, 0, Math.sin(a0) * ORBIT_R];
  const tang: V3 = [-Math.sin(a0), 0, Math.cos(a0)];
  const after = Math.max(0, frame - st);
  const e: V3 = frame < st ? earthOnOrbit(frame) : [base[0] + tang[0] * after * 0.06, 0, base[2] + tang[2] * after * 0.06];
  const far: V3 = [base[0] + tang[0] * 40, 0, base[2] + tang[2] * 40];
  const snapped = frame >= st;
  if (shot === 0) {
    // Draufsicht: die Bahnlinie reißt, Erde und Mond ziehen geradeaus ins Schwarze
    const a = frameOn([base[0] * 0.6, 0, base[2] * 0.6], 22, 0.5, 0.5, [0, 1, 0.22]);
    const b = frameOn([base[0] * 0.6 + tang[0] * 2, 0, base[2] * 0.6 + tang[2] * 2], 21, 0.5, 0.5, [0, 1, 0.22]);
    return (
      <>
        <SpaceSet frame={frame} sunLight={snapped ? 0 : 1} sunAt={[0, 30, 0]} />
        <SunDisc position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} radius={2} on={0} ghost={snapped ? 0.4 : 1} />
        <OrbitDots radius={ORBIT_R} n={90} on={snapped ? Math.max(0.15, 1 - after / 20) : 0.8} dot={0.1} />
        <DotLine from={base} to={far} n={40} on={snapped ? Math.min(1, after / 6) : 0} dot={0.12} />
        <EarthBall position={e} radius={0.9} moon moonAngle={frame * 0.05} glow={0.6} spin={frame * 0.01} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: hinter Erde und Mond verblasst die alte gekrümmte Bahn
  const cam = { pos: [e[0] + tang[0] * 5 + 1.5, 2.2, e[2] + tang[2] * 5 + 0.5] as V3, look: [e[0] - tang[0] * 2, -0.3, e[2] - tang[2] * 2] as V3, fov: 44 };
  return (
    <>
      <SpaceSet frame={frame} sunLight={0} />
      <OrbitDots radius={ORBIT_R} n={90} on={Math.max(0, 0.6 - f / 60)} dot={0.1} />
      <DotLine from={base} to={far} n={40} on={0.9} dot={0.12} />
      <EarthBall position={e} radius={0.9} moon moonAngle={frame * 0.05} glow={0.5} spin={frame * 0.01} />
      <Shot frame={f} duration={len} from={cam.pos} look={cam.look} fov={cam.fov} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 19 moon – „Seconds later, the full Moon goes dark. | Saturn doesn't.“ */
/* ------------------------------------------------------------------ */
export const SonMoon: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("moon");
  if (shot === 0) {
    // Balkon: der Vollmond glüht noch, dann wird er zur dunklen Scheibe; Grandpa schaut hoch
    const d = beat("moonFades");
    const glow = 1 - ramp(frame, d - 6, d + 6);
    const head: V3 = [0, 2.72, 0];
    const a = frameOn(head, 7.4, 0.52, 0.5, [-0.25, -0.12, 1]);
    const b = frameOn(head, 6.8, 0.52, 0.5, [-0.22, -0.1, 1]);
    const moon = atScreen(b, 0.3, 0.27, 70);
    const sat = atScreen(b, 0.76, 0.33, 70);
    return (
      <>
        <BalconySet frame={frame} moon={glow} moonPos={moon} saturnPos={sat} telescope />
        <Ode frame={frame} look={-0.25} nod={-0.35} eyes={glow < 0.5 ? "wide" : "dot"} mouth={glow < 0.5 ? "o" : "flat"} scarf />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Okular-POV: Saturn leuchtet weiter
  return (
    <>
      <EyepieceView frame={frame} size={1.2} />
      <Shot frame={f} duration={len} from={[0, 0, 12.4]} to={[0, 0, 12.0]} look={[0, 0, 0]} fov={40} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 20 ocean – „Over time, ice seals the seas. | At hot vents, a few microbes survive.“ */
/* ------------------------------------------------------------------ */
export const SonOcean: React.FC = () => {
  const { frame, beat, shot, f, len, cuts } = useShots("ocean");
  if (shot === 0) {
    // Totale über dem Meer im Sternenlicht: eine weiße Eishaut kriecht darüber (Zeitsprung „OVER TIME“)
    const t = ramp(frame, 0, (cuts[0] ?? 60) + 10, (x) => x) * 0.6 + 0.3;
    const a = frameOn([0, 0, -8], 18, 0.58, 0.5, [0, 0.42, 1]);
    const b = frameOn([0, 0, -8], 16, 0.58, 0.5, [0, 0.4, 1]);
    const tag = atScreen(b, 0.5, 0.3, 10);
    return (
      <>
        <color attach="background" args={[S.nightTop]} />
        <fog attach="fog" args={["#050818", 30, 140]} />
        <hemisphereLight args={["#3A4A8A", "#05060C", 0.5]} />
        <directionalLight position={[-10, 20, 10]} color={S.iceBlue} intensity={2.2} />
        <SkyDome day={0} />
        <Stars show={1} frame={frame} upper />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]}>
          <planeGeometry args={[300, 200]} />
          <meshPhysicalMaterial color="#0B2A44" roughness={0.15} clearcoat={1} />
        </mesh>
        <IceSheet t={t} size={70} />
        <group position={tag} rotation={faceTo(tag, b.pos)}>
          <TextLabel text="OVER TIME" width={3.2} height={0.7} position={[0, 0, 0]} color="#FFFFFF" bg={S.hud} />
        </group>
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Tauchfahrt: durch das Eis ins dunkle Wasser bis zum Meeresgrund
    const u = ramp(f, 0, len, (x) => x * x * (3 - 2 * x));
    const y = lerp(3, -16, u);
    const under = y < 0;
    return (
      <>
        <color attach="background" args={[under ? "#02101C" : S.nightTop]} />
        <fog attach="fog" args={[under ? "#0A2C48" : "#050818", under ? 3 : 30, under ? 30 : 140]} />
        <hemisphereLight args={["#7AAAE0", "#02060C", 1.1]} />
        <directionalLight position={[-6, 20, 6]} color={S.iceBlue} intensity={1.0} />
        {!under ? <SkyDome day={0} /> : null}
        <IceSheet t={1} size={70} y={0} />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#9FC8E8" transparent opacity={0.5} side={2} />
        </mesh>
        <Motes frame={frame} center={[0, y, 0]} size={[10, 14, 10]} count={160} drift={[0, 0.03, 0]} color="#BFE0FF" dot={0.06} opacity={0.6} seed={31} />
        {[-3, 0.5, 3.5].map((x, i) => (
          <LightShaft key={i} from={[x, -0.2, -2 - i]} to={[x * 1.4, -16, -4 - i]} radius={2.2} top={0.9} color="#9FD0FF" opacity={0.16} />
        ))}
        <SeaFloor y={-20} />
        <Vent position={[0.5, -20, -3]} frame={frame} microbes={0.6} />
        <Shot frame={f} duration={len} from={[0.6, y, 4]} look={[0.3, y - 6, -1]} fov={46} ease="linear" />
      </>
    );
  }
  // Makro: Schlot pafft warmen schwarzen Rauch, ein paar grün glimmende Mikroben-Punkte
  const sv = beat("ventMicrobes");
  const m = 0.5 + 0.5 * ramp(frame, sv - 8, sv + 6);
  const a = frameOn([0, 1.7, 0], 4.6, 0.5, 0.5, [0.3, 0.12, 1]);
  const b = frameOn([0, 1.8, 0], 3.9, 0.5, 0.5, [0.25, 0.14, 1]);
  return (
    <>
      <color attach="background" args={["#020A12"]} />
      <fog attach="fog" args={["#03121E", 4, 22]} />
      <hemisphereLight args={["#4A7AA0", "#02060C", 0.9]} />
      <SeaFloor y={0} />
      <Vent position={[0, 0, 0]} frame={frame} microbes={m} />
      <Motes frame={frame} center={[0, 2, 0]} size={[6, 6, 6]} count={80} drift={[0, 0.01, 0]} color="#9FD0FF" dot={0.04} opacity={0.4} seed={33} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 21 saturn – „Two hours after the dark, Saturn still glows… | for a vanished Sun.“ */
/* ------------------------------------------------------------------ */
export const SonSaturn: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("saturn");
  if (shot === 0) {
    // Okular-POV: Saturn glüht noch blassgold (Sticker „+2 H“)
    return (
      <>
        <EyepieceView frame={frame} size={1.25} />
        <Shot frame={f} duration={len} from={[0, 0, 12.6]} to={[0, 0, 11.8]} look={[0, 0, 0]} fov={40} ease="linear" />
      </>
    );
  }
  // Nah: Grandpa im Schal, Atem sichtbar, große runde Augen am Okular (Schlussbild bekommt neue Bedeutung)
  const h = odeScopeHead();
  const a = frameOn(h, 4.0, 0.5, 0.45, [0.75, -0.08, -1]);
  const b = frameOn(h, 3.4, 0.5, 0.45, [0.7, -0.08, -1]);
  const breath = Math.max(0, Math.sin(frame * 0.09)) ** 2;
  const sun = beat("grandpaStares");
  return (
    <>
      <BalconySet frame={frame} moon={0} />
      <Ode frame={frame} position={ODE_SCOPE.position} rotation={ODE_SCOPE.rotation} lean={ODE_SCOPE.lean - 0.12} nod={ODE_SCOPE.nod - 0.1} eyes="wide" eyePop={eyePopAt(frame, sun, 1.4, 1.2)} mouth="o" scarf breath={breath} reach={[1.1, 1.0]} />
      <Motes frame={frame} center={[EYEPIECE[0], EYEPIECE[1] + 0.5, EYEPIECE[2]]} size={[4, 3, 4]} count={70} drift={[0.002, -0.006, 0]} color="#E6F2FF" dot={0.04} opacity={0.7} seed={41} />
      <Halo at={EYEPIECE} size={0.6} color={S.gold} opacity={0.55} />
      <pointLight position={[h[0] + 1.2, h[1] + 0.3, h[2] - 1.6]} color="#DDE8FF" intensity={6} distance={5} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 22 tally – „Eight minutes of light. | Two hours of glow.“ */
/* ------------------------------------------------------------------ */
export const SonTally: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("tally");
  if (shot === 0) {
    // Geteiltes Bild: links goldener Balken „8 MIN“ (Sonnenlicht), rechts 15× so hoher Balken „2 H“ (Saturn-Glanz) – maßstabsgetreu
    const g1 = ramp(frame, beat("bar8min") - 10, beat("bar8min") + 6);
    const g2 = ramp(frame, beat("bar2h") - 14, beat("bar2h") + 10);
    const unit = 0.26;
    const cam = { pos: [0, 1.1, 15] as V3, look: [0, 1.1, 0] as V3, fov: 40 };
    const bar = (x: number, h: number, color: string, label: string, sub: string, on: number) => (
      <group position={[x, 0, 0]}>
        <mesh position={[0, (h * on) / 2, 0]}>
          <boxGeometry args={[1.5, Math.max(0.001, h * on), 0.4]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <Halo at={[0, h * on, 0.3]} size={2.2} color={color} opacity={0.6 * on} />
        <TextLabel text={label} width={2.2} height={0.62} position={[0, h * on + 0.6, 0.3]} color="#FFD23F" opacity={on} />
        <TextLabel text={sub} width={2.6} height={0.38} position={[0, -0.42, 0.3]} color="#FFFFFF" opacity={Math.max(0.35, on)} />
      </group>
    );
    return (
      <>
        <SpaceSet frame={frame} stars={0.5} />
        <mesh position={[0, -0.02, 0]}>
          <planeGeometry args={[7, 0.05]} />
          <meshBasicMaterial color="#5A6A9A" />
        </mesh>
        <mesh position={[0, 2.4, -0.3]}>
          <planeGeometry args={[0.04, 5.6]} />
          <meshBasicMaterial color="#2A3460" />
        </mesh>
        {bar(-1.7, unit, S.gold, "8 MIN", "SUNLIGHT", g1)}
        {bar(1.7, unit * 15, S.goldPale, "2 H", "SATURN", g2)}
        <Shot frame={f} duration={len} from={cam.pos} to={[0, 1.1, 14.4]} look={cam.look} fov={cam.fov} />
      </>
    );
  }
  // Okular-POV: Saturns Glanz beginnt zu schwinden
  return (
    <>
      <EyepieceView frame={frame} size={1.25} glow={1 - 0.45 * ramp(f, 0, len)} />
      <Shot frame={f} duration={len} from={[0, 0, 11.8]} to={[0, 0, 11.4]} look={[0, 0, 0]} fov={40} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 23 answer2 – „Then Saturn goes dark… | and the Sun has just vanished.“ (Loop in den Hook) */
/* ------------------------------------------------------------------ */
export const SonAnswer2: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("answer2");
  if (shot === 0) {
    // Okular-POV: Saturn erlischt im Okular
    const d = beat("saturnFades");
    const glow = 1 - ramp(frame, d - 10, d + 12);
    return (
      <>
        <EyepieceView frame={frame} size={1.25} glow={glow} stars={1 - ramp(frame, d, d + 20) * 0.6} />
        <Shot frame={f} duration={len} from={[0, 0, 11.4]} to={[0, 0, 11.2]} look={[0, 0, 0]} fov={40} />
      </>
    );
  }
  // Match Cut aufs erste Bild: blauer Mittag, die goldene Sonne erlischt wieder auf „vanished“ – Juno lächelt im Licht
  const v = beat("loopToHook");
  const d = frame - v;
  const on = d < 0 ? 1 : d < 10 ? (d % 5 < 2 ? 0.8 : 0.1) : 0;
  const ring = d < 0 ? 0 : 1;
  return <HookFrame frame={frame} f={f} len={len} ring={ring} flicker={on} />;
};
