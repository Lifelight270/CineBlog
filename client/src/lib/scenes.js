import gsap from 'gsap';

// Each scene is a surface, an ink and an accent. Everything else derives from them with opacity.
export const SCENES = {
  dusk:   { bg: [18, 16, 43],  ink: [243, 239, 255], accent: [139, 123, 255] },
  plum:   { bg: [44, 16, 70],  ink: [255, 238, 247], accent: [255, 111, 174] },
  lagoon: { bg: [8, 52, 56],   ink: [226, 255, 246], accent: [94, 242, 192] },
  amber:  { bg: [64, 36, 10],  ink: [255, 243, 214], accent: [255, 179, 71] },
};

const d = SCENES.dusk;
// Live values: read by CSS variables (via onUpdate) and by the 3D scene (via useFrame).
export const live = {
  bgR: d.bg[0], bgG: d.bg[1], bgB: d.bg[2],
  inkR: d.ink[0], inkG: d.ink[1], inkB: d.ink[2],
  acR: d.accent[0], acG: d.accent[1], acB: d.accent[2],
  progress: 0,
  scene: 'dusk',
};

const apply = () => {
  const s = document.documentElement.style;
  const r = Math.round;
  s.setProperty('--bg', `${r(live.bgR)} ${r(live.bgG)} ${r(live.bgB)}`);
  s.setProperty('--ink', `${r(live.inkR)} ${r(live.inkG)} ${r(live.inkB)}`);
  s.setProperty('--accent', `${r(live.acR)} ${r(live.acG)} ${r(live.acB)}`);
};

export function setScene(name, immediate = false) {
  const sc = SCENES[name] || SCENES.dusk;
  live.scene = name;
  const to = {
    bgR: sc.bg[0], bgG: sc.bg[1], bgB: sc.bg[2],
    inkR: sc.ink[0], inkG: sc.ink[1], inkB: sc.ink[2],
    acR: sc.accent[0], acG: sc.accent[1], acB: sc.accent[2],
  };
  if (immediate) {
    Object.assign(live, to);
    apply();
    return;
  }
  gsap.to(live, { ...to, duration: 1.2, ease: 'power2.out', overwrite: 'auto', onUpdate: apply });
}
