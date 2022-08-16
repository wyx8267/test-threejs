import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./index.scss";

const AlignHtmlElements: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const scene = new Three.Scene();
    const camera = new PerspectiveCamera(45, 2, 0.1, 200);
    camera.position.z = 7
    scene.add(camera);

    const light = new Three.DirectionalLight(0xFFFFFF, 1)
    light.position.set(-1, 2, 4)
    scene.add(light)

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    // controls.enableDamping = true
    // controls.enablePan = false
    // controls.minDistance = 1
    // controls.maxDistance = 4
    controls.update();

    const labelContainerElem = document.querySelector("#labels");
    const geometry = new Three.BoxGeometry(1, 1, 1)
    const cubes = [
      makeInstance(geometry, 0x44aa88, 0, "Aqua Colored Box"),
      makeInstance(geometry, 0x8844aa, -2, "Purple Colored Box"),
      makeInstance(geometry, 0xaa8844, 2, "Gold Colored Box"),
    ];
    const tempV = new Three.Vector3()
    const raycaster = new Three.Raycaster()

    function makeInstance(
      geometry: Three.BufferGeometry,
      color: Three.ColorRepresentation,
      x: number,
      name: string
    ) {
      const material = new Three.MeshPhongMaterial({ color });
      const cube = new Three.Mesh(geometry, material);
      scene.add(cube);
      cube.position.x = x;

      const elem = document.createElement("div");
      elem.textContent = name;
      labelContainerElem?.appendChild(elem);

      return { cube, elem };
    }

    function resizeRendererToDisplaySize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    function render(time: number) {
      time *= 0.001
      cubes.forEach((cubeInfo, ndx) => {
        const { cube, elem } = cubeInfo
        const speed = 1 + ndx * 0.1
        const rot = time * speed
        cube.rotation.x = rot
        cube.rotation.y = rot

        cube.updateWorldMatrix(true, false)
        cube.getWorldPosition(tempV)
        tempV.project(camera)

        raycaster.setFromCamera(tempV, camera)
        const intersectedObjects = raycaster.intersectObjects(scene.children)
        const show = intersectedObjects.length && cube === intersectedObjects[0].object

        if (!show || Math.abs(tempV.z) > 1) {
          elem.style.display = 'none'
        } else {
          elem.style.display = ''
          const x = (tempV.x * 0.5 + 0.5) * canvas.clientWidth
          const y = (tempV.y * -0.5 + 0.5) * canvas.clientHeight
          elem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
          elem.style.zIndex = ((-tempV.z * 0.5 + 0.5) * 100000 | 0).toString()
        }
      })

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, [canvasRef]);

  return (
    <div id="container">
      <canvas ref={canvasRef} className="c" />
      <div id="labels"></div>
    </div>
  );
};

export default AlignHtmlElements;
