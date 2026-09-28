import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';

/**
 * Premium 3D crypto payment card. A single rounded-box mesh: the front face
 * uses the exact supplied card artwork, the back/edges are generated to match
 * its palette. All motion (drag inertia, pointer tilt, scroll and intro)
 * lives in `tick()` and is unchanged from the object this scene used to render.
 */

const BG = '#dbdbda';
const CARD_W = 1455;
const CARD_H = 789; // matches the source card artwork's own bounding box (see opaqueBounds)
const FRONT_IMAGE = '/card-front.webp';
const BACK_IMAGE = '/card-back.png';
const CARD_CREAM = '#f2efe8';

/**
 * Bounding box of the card artwork itself within the source file, in its own pixel
 * space. The file sits on a flat grey page background with a plain margin around the
 * card (its alpha channel isn't usable here — the browser decodes it fully opaque),
 * so the crop is found by scanning for the card's own orange rim / dark ink instead.
 */
function opaqueBounds(img: HTMLImageElement) {
  const probe = document.createElement('canvas');
  probe.width = img.naturalWidth;
  probe.height = img.naturalHeight;
  const pctx = probe.getContext('2d')!;
  pctx.drawImage(img, 0, 0);
  const { data, width, height } = pctx.getImageData(0, 0, probe.width, probe.height);
  const isCardPixel = (i: number) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 170 && r - g > 60 && r - b > 90) return true; // orange rim/fill
    if (r < 60 && g < 60 && b < 60) return true; // logo/text ink
    return false;
  };
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const step = 3;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (!isCardPixel((y * width + x) * 4)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: width, h: height };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Same idea as `opaqueBounds`, but for a source file with genuine, correctly-decoded alpha. */
function alphaBounds(img: HTMLImageElement) {
  const probe = document.createElement('canvas');
  probe.width = img.naturalWidth;
  probe.height = img.naturalHeight;
  const pctx = probe.getContext('2d')!;
  pctx.drawImage(img, 0, 0);
  const { data, width, height } = pctx.getImageData(0, 0, probe.width, probe.height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] < 10) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: width, h: height };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * The front face is the exact card artwork supplied for the brand. The source file
 * has a plain background margin around the card's own rounded silhouette (so it can
 * sit on any page) — that margin is cropped out here and the card art is stretched
 * edge-to-edge, so the 3D geometry's own rounded bevel is the only visible edge and
 * no backing colour shows through as a ring while it rotates.
 */
function makeFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = CARD_CREAM;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const img = new Image();
  img.onload = () => {
    const b = opaqueBounds(img);
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.drawImage(img, b.x, b.y, b.w, b.h, 0, 0, CARD_W, CARD_H);
    tex.needsUpdate = true;
  };
  img.src = FRONT_IMAGE;

  return tex;
}

/**
 * The back face is the exact card-back artwork supplied for the brand (magstripe,
 * signature strip, CVV). This file's alpha channel decodes correctly, so its true
 * transparent margin is used directly to find the crop.
 */
function makeBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = CARD_CREAM;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const img = new Image();
  img.onload = () => {
    const b = alphaBounds(img);
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = CARD_CREAM;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.drawImage(img, b.x, b.y, b.w, b.h, 0, 0, CARD_W, CARD_H);
    tex.needsUpdate = true;
  };
  img.src = BACK_IMAGE;

  return tex;
}

export class BlobScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  private readonly group = new THREE.Group();
  private readonly disposables: { dispose: () => void }[] = [];
  private readonly io: IntersectionObserver;
  private readonly ro: ResizeObserver;
  private readonly clock = new THREE.Clock();

  private visible = true;
  private active = true;
  private time = 0;
  private scroll = 0;
  private lastScroll = 0;
  private fit = 1;
  private readonly rot = { x: 0.2, y: 0 };
  private readonly vel = { x: 0, y: 0 };
  private readonly pointer = { x: 0, y: 0 };
  private readonly tilt = { x: 0, y: 0 };
  private dragging = false;
  private last = { x: 0, y: 0 };
  /** 0 → hidden, 1 → full size. Animated by `intro()`. */
  state = { appear: 0, wobble: 0 };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.setClearColor(BG, 1);

    this.scene.background = new THREE.Color(BG);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    pmrem.dispose();

    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    const width = 1.75;
    const height = width / (CARD_W / CARD_H);
    const depth = 0.032;
    const geometry = new RoundedBoxGeometry(width, height, depth, 5, 0.09);

    const frontTex = makeFrontTexture();
    const backTex = makeBackTexture();

    const edgeMat = new THREE.MeshPhysicalMaterial({
      color: '#ff5a14',
      metalness: 0.35,
      roughness: 0.4,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
    });
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      metalness: 0.1,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });
    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      metalness: 0.1,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });

    // RoundedBoxGeometry keeps BoxGeometry's face groups: [+x, -x, +y, -y, +z, -z].
    const cardMesh = new THREE.Mesh(geometry, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]);
    this.group.add(cardMesh);
    this.scene.add(this.group);
    this.camera.position.set(0, 0, 7.2);
    this.disposables.push(geometry, edgeMat, frontMat, backMat, frontTex, backTex, env);

    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    });
    this.io.observe(canvas);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();

    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    gsap.ticker.add(this.tick);
  }

  intro() {
    gsap.to(this.state, { appear: 1, duration: 1.8, ease: 'expo.out' });
    gsap.fromTo(this.state, { wobble: 1 }, { wobble: 0, duration: 2.4, ease: 'power2.out' });
  }

  setScroll(progress: number) {
    this.scroll = progress;
  }

  setActive(active: boolean) {
    this.active = active;
    this.canvas.classList.toggle('is-hidden', !active);
  }

  dispose() {
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this.state);
    this.io.disconnect();
    this.ro.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const visibleWidth = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(15)) * this.camera.aspect;
    this.fit = Math.min(1, (visibleWidth * 0.78) / 2.2);
  }

  private onDown = (e: PointerEvent) => {
    this.dragging = true;
    this.last = { x: e.clientX, y: e.clientY };
    this.canvas.classList.add('is-dragging');
  };

  private onMove = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (!this.dragging) return;
    this.vel.y += (e.clientX - this.last.x) * 0.0022;
    this.vel.x += (e.clientY - this.last.y) * 0.0022;
    this.last = { x: e.clientX, y: e.clientY };
  };

  private onUp = () => {
    this.dragging = false;
    this.canvas.classList.remove('is-dragging');
  };

  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible || !this.active || document.hidden) return;

    const scrollDelta = this.scroll - this.lastScroll;
    this.lastScroll = this.scroll;
    this.time += dt * (1 + Math.min(4, Math.abs(scrollDelta) * 120));

    this.vel.y += dt * 0.12 + scrollDelta * 5;
    this.rot.x += this.vel.x;
    this.rot.y += this.vel.y;
    this.vel.x *= 0.92;
    this.vel.y *= 0.92;
    this.rot.x += (0.2 - this.rot.x) * 0.01;

    this.tilt.x += (this.pointer.y * 0.18 - this.tilt.x) * 0.05;
    this.tilt.y += (this.pointer.x * 0.25 - this.tilt.y) * 0.05;
    this.group.rotation.set(this.rot.x + this.tilt.x, this.rot.y + this.tilt.y, 0);

    const s = this.state.appear * this.fit * (1 + Math.min(this.scroll, 0.66) * 0.35);
    this.group.scale.setScalar(Math.max(0.0001, s));
    this.group.position.y = -Math.min(this.scroll, 0.66) * 0.35;

    this.renderer.render(this.scene, this.camera);
  };
}
