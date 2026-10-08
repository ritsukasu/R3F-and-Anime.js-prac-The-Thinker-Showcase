import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Scroll,
  ScrollControls,
  useGLTF,
  useScroll,
} from '@react-three/drei';
import * as THREE from 'three';
import { parts } from '../data/parts';

const GROUND_Y = -1.25;

const cameraStates = [
  { focus: [0.5, 0.5] as [number, number], distance: 4.15, turn: -0.12, side: 1 },
  ...parts.map((part) => ({
    focus: part.focus,
    distance: part.distance,
    turn: part.turn,
    side: part.textSide === 'left' ? 1 : -1,
  })),
];
const scrollPages = cameraStates.length + 0.2;

const modelBox = new THREE.Box3(new THREE.Vector3(-1, GROUND_Y, -0.8), new THREE.Vector3(1, 1.1, 0.8));

function sample(offset: number) {
  const position = Math.min(offset * cameraStates.length, cameraStates.length - 1);
  const index = Math.min(cameraStates.length - 2, Math.floor(position));
  const blend = THREE.MathUtils.smoothstep(position - index, 0, 1);
  return { from: cameraStates[index], to: cameraStates[index + 1], blend };
}

function Thinker() {
  const { scene } = useGLTF('/models/the-thinker.glb');
  const model = useMemo(() => scene.clone(), [scene]);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    const bounds = new THREE.Box3().setFromObject(model, true);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 2.7 / Math.max(size.x, size.y, size.z);
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const groundedBounds = new THREE.Box3().setFromObject(model, true);
    model.position.y += GROUND_Y - groundedBounds.min.y;
    model.updateMatrixWorld(true);
    modelBox.setFromObject(model, true);
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          const monochrome = material.clone();
          if ('color' in monochrome && monochrome.color instanceof THREE.Color) {
            const lightness = monochrome.color.getHSL({ h: 0, s: 0, l: 0 }).l;
            monochrome.color.setHSL(0, 0, Math.max(0.08, lightness));
          }
          object.material = monochrome;
               });
      }
    });
  }, [model]);

  const scroll = useScroll();
  useFrame((_, delta) => {
    if (!group.current) return;
    const { from, to, blend } = sample(scroll.offset);
    const position = Math.min(scroll.offset * cameraStates.length, cameraStates.length - 1);
    const section = Math.min(parts.length - 1, Math.max(0, Math.floor(position) - 1));
    const nextSection = Math.min(parts.length - 1, section + 1);
    const modelSide = THREE.MathUtils.lerp(
        parts[section].textSide === 'right' ? -0.3 : 0.35,
        parts[nextSection].textSide === 'right' ? -0.3 : 0.35,
      blend,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      THREE.MathUtils.lerp(from.turn, to.turn, blend),
      4,
      delta,
    );
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      position < 1 ? 0.3 : modelSide,
      4,
      delta,
    );
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  const scroll = useScroll();
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const smoothLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const { from, to, blend } = sample(scroll.offset);
    const mix = (a: number, b: number) => THREE.MathUtils.lerp(a, b, blend);

    const worldX = THREE.MathUtils.lerp(modelBox.min.x, modelBox.max.x, mix(from.focus[0], to.focus[0]));
    const worldY = THREE.MathUtils.lerp(modelBox.min.y, modelBox.max.y, mix(from.focus[1], to.focus[1]));
    const worldZ = (modelBox.min.z + modelBox.max.z) / 2;
    const distance = mix(from.distance, to.distance);
    const side = mix(from.side, to.side);

    const fov = (camera as THREE.PerspectiveCamera).fov;
    const halfH = distance * Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const halfW = halfH * (size.width / size.height);
    const mobile = size.width <= 700;
    const shiftX = mobile ? 0 : side * 0.5 * halfW;
    const shiftY = mobile ? 0.32 * halfH : 0;

    look.set(worldX - shiftX, worldY + shiftY, worldZ);
    target.set(look.x, look.y, worldZ + distance);
    const k = 1 - Math.exp(-3 * delta);
    camera.position.lerp(target, k);
    smoothLook.lerp(look, k);
    camera.lookAt(smoothLook);
  });

  return null;
}

function Story() {
  const scroll = useScroll();

  const scrollToPage = (page: number) => {
    scroll.el.scrollTo({
      top: page * scroll.el.clientHeight,
      behavior: 'smooth',
    });
  };

  return (
    <Scroll html style={{ width: '100%' }}>
      <header className="topbar">
        <a
          className="wordmark"
          href="#top"
          aria-label="The Thinker home"
          onClick={(event) => {
            event.preventDefault();
            scrollToPage(0);
          }}
        >
          <span>ritsuka</span>
        </a>
      </header>

      <main id="top">
        <section className="hero-panel">
          <div className="eyebrow">DIGITAL SCULPTURE / 2026</div>
          <h1>The<br /><em>Thinker</em></h1>
          <p className="hero-copy">A study in stillness, translated from Rodin&apos;s bronze into a living, scrollable form.</p>
          <a
            className="scroll-cue"
            href="#story"
            onClick={(event) => {
              event.preventDefault();
              scrollToPage(1);
            }}
          >
            BEGIN THE STUDY
          </a>
        </section>

        {parts.map((part, index) => (
          <section id={index === 0 ? 'story' : undefined} className={`story-panel part-panel copy-${part.textSide}`} key={part.id}>
            <div className="part-marker">
              <div className="marker-head">
                <span className="marker-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="marker-label">{part.label}</span>
              </div>
            </div>
            <div className="part-copy">
              <p className="part-kicker">AUGUSTE RODIN</p>
              <h2>{part.title}</h2>
              <p className="part-description">{part.description}</p>
              <p className="part-note"><span>Look for</span> {part.note}</p>
            </div>
          </section>
        ))}
      </main>
      <div className="footer-page">
        <footer className="site-footer"><span>3D ARTIST &amp; WEBSITE CREATOR</span><strong>ritsuka</strong><span>2026</span></footer>
      </div>
    </Scroll>
  );
}

export function ModelViewer() {
  return (
    <div className="showcase">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.5, 4.8], fov: 38 }}>
        <color attach="background" args={['#f3f3f0']} />
        <fog attach="fog" args={['#f3f3f0', 7, 13]} />
        <ambientLight intensity={1.4} />
        <directionalLight castShadow position={[3, 5, 4]} intensity={3} shadow-mapSize={[2048, 2048]} />
        <Environment preset="studio" environmentIntensity={0.55} />
        <ScrollControls pages={scrollPages} damping={0.16}>
          <CameraRig />
          <Suspense fallback={null}><Thinker /></Suspense>
          <ContactShadows position={[0, GROUND_Y + 0.004, 0]} opacity={0.5} scale={4} blur={1.8} far={1.4} resolution={1024} />
          <Story />
        </ScrollControls>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/the-thinker.glb');