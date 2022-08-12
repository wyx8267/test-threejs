import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./index.scss";

type SceneInfo = {
  scene: Three.Scene;
  camera: Three.PerspectiveCamera;
  elem: Element | null;
  mesh?: Three.Mesh;
};

function makeScene(elem: Element | null): SceneInfo {
  const scene = new Three.Scene();
  scene.background = new Three.Color(0xffffff);

  const camera = new Three.PerspectiveCamera(45, 2, 0.1, 5);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  const light = new Three.DirectionalLight(0xffffff, 1);
  light.position.set(-1, 2, 4);
  scene.add(light);

  return { scene, camera, elem };
}

function setupScene1() {
  const sceneInfo = makeScene(document.querySelector("#box"));
  const geometry = new Three.BoxGeometry(1, 1, 1);
  const material = new Three.MeshPhongMaterial({ color: "red" });
  const mesh = new Three.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function setupScene2() {
  const sceneInfo = makeScene(document.querySelector("#pyramid"));
  const geometry = new Three.SphereGeometry(0.8, 4, 2);
  const material = new Three.MeshPhongMaterial({
    color: "blue",
    flatShading: true,
  });
  const mesh = new Three.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function renderSceneInfo(sceneInfo: SceneInfo, renderer: Three.WebGLRenderer, canvas: HTMLCanvasElement) {
  const { scene, camera, elem } = sceneInfo;

  const { left, right, top, bottom, width, height } =
    elem?.getBoundingClientRect() as DOMRect;

  const isOffScreen =
    bottom < 0 ||
    top > renderer.domElement.clientHeight ||
    right < 0 ||
    left > renderer.domElement.clientWidth;
  if (isOffScreen) return;

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  const positiveYUpBottom = canvas.height - bottom
  renderer.setScissor(left, positiveYUpBottom, width, height)
  renderer.setViewport(left, positiveYUpBottom, width, height)
  renderer.render(scene, camera)
}

let flag = false;

const MultipleScenes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const sceneInfo1 = setupScene1();
    const sceneInfo2 = setupScene2();

    const render = (time: number) => {
      flag = false;
      time *= 0.001
      // handleResize()

      const transform = `translateY(${window.scrollY}px)`;
      renderer.domElement.style.transform = transform;
      renderer.setScissorTest(false)
      renderer.clear(true, true)
      renderer.setScissorTest(true)

      sceneInfo1.mesh && (sceneInfo1.mesh.rotation.y = time * 0.1)
      sceneInfo2.mesh && (sceneInfo2.mesh.rotation.y = time * 0.1)
      renderSceneInfo(sceneInfo1, renderer, canvas)
      renderSceneInfo(sceneInfo2, renderer, canvas)
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const handleChange = () => {
      if (flag === false) {
        flag = true;
        window.requestAnimationFrame(render);
      }
    };

    // const controls = new OrbitControls(camera, canvasRef.current);
    // // controls.addEventListener("change", render);
    // controls.addEventListener("change", handleChange);
    // controls.enableDamping = true;
    // controls.update();

    const handleResize = () => {
      if (canvasRef.current === null) {
        return;
      }
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      renderer.setSize(width, height, false);
      window.requestAnimationFrame(render);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return (
    <>
      <canvas ref={canvasRef} id="c" />
      <p>
        <span id="box" className="diagram left"></span>I love boxes. Presents
        come in boxes. When I find a new box I'm always excited to find out
        what's inside.
      </p>
      <p>
        <span id="pyramid" className="diagram right"></span>
        When I was a kid I dreamed of going on an expedition inside a pyramid
        and finding a undiscovered tomb full of mummies and treasure.
      </p>
    </>
  );
};

export default MultipleScenes;
