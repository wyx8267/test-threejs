import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import "./index.scss";
const sceneElements: any[] = [];

type SceneInfo = {
  scene: Three.Scene;
  camera: Three.PerspectiveCamera;
  elem?: Element | null;
  mesh?: Three.Mesh;
  controls?: TrackballControls;
};

function makeScene(elem: Element | null): SceneInfo {
  const scene = new Three.Scene();
  scene.background = new Three.Color(0xffffff);

  const camera = new Three.PerspectiveCamera(45, 2, 0.1, 5);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const controls = new TrackballControls(camera, elem as HTMLElement);
  controls.noZoom = true;
  controls.noPan = true;

  const light = new Three.DirectionalLight(0xffffff, 1);
  light.position.set(-1, 2, 4);
  camera.add(light);

  return { scene, camera, controls };
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

function renderSceneInfo(
  sceneInfo: SceneInfo,
  renderer: Three.WebGLRenderer,
  canvas: HTMLCanvasElement
) {
  const { scene, camera, elem } = sceneInfo;

  const { left, right, top, bottom, width, height } =
    elem?.getBoundingClientRect() as DOMRect;

  const isOffScreen =
    bottom < 0 ||
    top > renderer.domElement.clientHeight ||
    right < 0 ||
    left > renderer.domElement.clientWidth;
  if (isOffScreen) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const positiveYUpBottom = canvas.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.render(scene, camera);
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

    // const sceneInfo1 = setupScene1();
    // const sceneInfo2 = setupScene2();

    const sceneInitFunctionsByName = {
      box: (elem: Element) => {
        const { scene, camera, controls } = makeScene(elem);
        const geometry = new Three.BoxGeometry(1, 1, 1);
        const material = new Three.MeshPhongMaterial({ color: "red" });
        const mesh = new Three.Mesh(geometry, material);
        scene.add(mesh);
        return (time: number, rect: DOMRect) => {
          mesh.rotation.y = time * 0.1;
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          controls?.handleResize();
          controls?.update();
          renderer.render(scene, camera);
        };
      },
      pyramid: (elem: Element) => {
        const { scene, camera, controls } = makeScene(elem);
        const geometry = new Three.SphereGeometry(0.8, 4, 2);
        const material = new Three.MeshPhongMaterial({
          color: "blue",
          flatShading: true,
        });
        const mesh = new Three.Mesh(geometry, material);
        scene.add(mesh);
        return (time: number, rect: DOMRect) => {
          mesh.rotation.y = time * 0.1;
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          controls?.handleResize();
          controls?.update();
          renderer.render(scene, camera);
        };
      },
    };
    document.querySelectorAll("[data-diagram]").forEach(elem => {
      const sceneName: any = (elem as HTMLElement).dataset.diagram;
      const sceneRenderFunction =
        sceneInitFunctionsByName[sceneName as "box" | "pyramid"](elem);
      addScene(elem, sceneRenderFunction);
    });

    function addScene(elem: Element, fn: any) {
      sceneElements.push({elem, fn});
    }

    const render = (time: number) => {
      flag = false;
      time *= 0.001;
      // handleResize()

      renderer.setScissorTest(false);
      renderer.clear(true, true);
      renderer.setScissorTest(true);

      const transform = `translateY(${window.scrollY}px)`;
      renderer.domElement.style.transform = transform;

      // sceneInfo1.mesh && (sceneInfo1.mesh.rotation.y = time * 0.1);
      // sceneInfo2.mesh && (sceneInfo2.mesh.rotation.y = time * 0.1);
      // renderSceneInfo(sceneInfo1, renderer, canvas);
      // renderSceneInfo(sceneInfo2, renderer, canvas);
      for (const {elem, fn} of sceneElements) {
        // get the viewport relative position of this element
        const rect = elem.getBoundingClientRect();
        const {left, right, top, bottom, width, height} = rect;
     
        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;
     
        if (!isOffscreen) {
          const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
          renderer.setScissor(left, positiveYUpBottom, width, height);
          renderer.setViewport(left, positiveYUpBottom, width, height);
     
          fn(time, rect);
        }
      }
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
        <span data-diagram="box" className="diagram left"></span>I love boxes.
        Presents come in boxes. When I find a new box I'm always excited to find
        out what's inside.
      </p>
      <p>
        <span data-diagram="pyramid" className="diagram right"></span>
        When I was a kid I dreamed of going on an expedition inside a pyramid
        and finding a undiscovered tomb full of mummies and treasure.
      </p>
    </>
  );
};

export default MultipleScenes;
