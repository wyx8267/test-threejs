import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import "./index.scss";

async function loadJSON(url: string) {
  const req = await fetch(url);
  return req.json();
}
let renderRequested = false;

const AlignHtmlElements: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0x39c5bb);
    const camera = new PerspectiveCamera(60, 2, 0.1, 10);
    camera.position.z = 2.5;
    scene.add(camera);

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 4;
    controls.update();

    const labelContainerElem = document.querySelector("#labels");
    // const geometry = new Three.BoxGeometry(1, 1, 1)
    // const cubes = [
    //   makeInstance(geometry, 0x44aa88, 0, "Aqua Colored Box"),
    //   makeInstance(geometry, 0x8844aa, -2, "Purple Colored Box"),
    //   makeInstance(geometry, 0xaa8844, 2, "Gold Colored Box"),
    // ];
    // const tempV = new Three.Vector3()
    // const raycaster = new Three.Raycaster()

    // function makeInstance(
    //   geometry: Three.BufferGeometry,
    //   color: Three.ColorRepresentation,
    //   x: number,
    //   name: string
    // ) {
    //   const material = new Three.MeshPhongMaterial({ color });
    //   const cube = new Three.Mesh(geometry, material);
    //   scene.add(cube);
    //   cube.position.x = x;

    //   const elem = document.createElement("div");
    //   elem.textContent = name;
    //   labelContainerElem?.appendChild(elem);

    //   return { cube, elem };
    // }

    {
      const loader = new Three.TextureLoader();
      const texture = loader.load(
        require("@/assets/imgs/country-outlines-4k.png")
      );
      const geometry = new Three.SphereGeometry(1, 64, 32);
      const material = new Three.MeshBasicMaterial({ map: texture });
      scene.add(new Three.Mesh(geometry, material));
    }

    let countryInfos: any[];
    async function loadCountryData() {
      countryInfos = require("@/assets/data/country-info.json");
      const lonFudge = Math.PI * 1.5;
      const latFudge = Math.PI;
      const lonHelper = new Three.Object3D();
      const latHelper = new Three.Object3D();
      lonHelper.add(latHelper);
      const positionHelper = new Three.Object3D();
      positionHelper.position.z = 1;
      latHelper.add(positionHelper);

      for (const countryInfo of countryInfos) {
        const { lat, lon, min, max, name } = countryInfo;
        lonHelper.rotation.y = Three.MathUtils.degToRad(lon) + lonFudge;
        latHelper.rotation.x = Three.MathUtils.degToRad(lat) + latFudge;

        positionHelper.updateWorldMatrix(true, false);
        const position = new Three.Vector3();
        positionHelper.getWorldPosition(position);
        countryInfo.position = position;

        const width = max[0] - min[0];
        const height = max[1] - min[1];
        const area = width * height;
        countryInfo.area = area;

        const elem = document.createElement("div");
        elem.textContent = name;
        elem.onclick = () => console.log('click===> ', name)
        labelContainerElem?.appendChild(elem);
        countryInfo.elem = elem;
      }
      requestRenderIfNotRequested();
    }
    loadCountryData();

    const tempV = new Three.Vector3();
    const cameraToPoint = new Three.Vector3();
    const cameraPosition = new Three.Vector3();
    const normalMatrix = new Three.Matrix3();
    const settings = {
      minArea: 20,
      maxVisibleDot: -0.2,
    };
    const gui = new GUI({ width: 300 });
    gui.add(settings, "minArea", 0, 50).onChange(requestRenderIfNotRequested);
    gui
      .add(settings, "maxVisibleDot", -1, 1, 0.01)
      .onChange(requestRenderIfNotRequested);
    function updateLabels() {
      if (!countryInfos) return;

      normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
      camera.getWorldPosition(cameraPosition);

      for (const countryInfo of countryInfos) {
        const { position, elem, area } = countryInfo;

        const large = settings.minArea * settings.minArea;
        if (area < large) {
          elem.style.display = "none";
          continue;
        }

        tempV.copy(position);
        tempV.applyMatrix3(normalMatrix);
        cameraToPoint.copy(position);
        cameraToPoint.applyMatrix4(camera.matrixWorldInverse).normalize();

        const dot = tempV.dot(cameraToPoint);
        if (dot > settings.maxVisibleDot) {
          elem.style.display = "none";
          continue;
        }

        elem.style.display = "";

        tempV.copy(position);
        tempV.project(camera);

        const x = (tempV.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (tempV.y * -0.5 + 0.5) * canvas.clientHeight;
        elem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        elem.style.zIndex = (((-tempV.z * 0.5 + 0.5) * 100000) | 0).toString();
      }
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

    function render() {
      // cubes.forEach((cubeInfo, ndx) => {
      //   const { cube, elem } = cubeInfo
      //   const speed = 1 + ndx * 0.1
      //   const rot = time * speed
      //   cube.rotation.x = rot
      //   cube.rotation.y = rot

      //   cube.updateWorldMatrix(true, false)
      //   cube.getWorldPosition(tempV)
      //   tempV.project(camera)

      //   raycaster.setFromCamera(tempV, camera)
      //   const intersectedObjects = raycaster.intersectObjects(scene.children)
      //   const show = intersectedObjects.length && cube === intersectedObjects[0].object

      //   if (!show || Math.abs(tempV.z) > 1) {
      //     elem.style.display = 'none'
      //   } else {
      //     elem.style.display = ''
      //     const x = (tempV.x * 0.5 + 0.5) * canvas.clientWidth
      //     const y = (tempV.y * -0.5 + 0.5) * canvas.clientHeight
      //     elem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
      //     elem.style.zIndex = ((-tempV.z * 0.5 + 0.5) * 100000 | 0).toString()
      //   }
      // })

      updateLabels();

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }

    render();
    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);

    return () => {
      controls.removeEventListener("change", requestRenderIfNotRequested);
      window.removeEventListener("resize", requestRenderIfNotRequested);
    };
  }, [canvasRef]);

  return (
    <div id="container">
      <canvas ref={canvasRef} className="c" />
      <div id="labels"></div>
    </div>
  );
};

export default AlignHtmlElements;
