import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GPUPickHelper from "./GPUPickHelper";
import "./index.scss";

interface CountryInfo {
  name: string;
  min: number[];
  max: number[];
  area: number;
  lat: number;
  lon: number;
  population: Record<string, number>;
  selected: boolean;
  position: Three.Vector3;
  elem: HTMLDivElement;
}

const pickHelper = new GPUPickHelper();
let renderRequested = false;

const IndexedTextures: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0x39c5bb);

    const pickingScene = new Three.Scene();
    pickingScene.background = new Three.Color(0);

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

    const tempColor = new Three.Color();
    function get255BasedColor(color: Three.ColorRepresentation) {
      tempColor.set(color);
      const base = tempColor.toArray().map(v => v * 255);
      base.push(255);
      return base;
    }

    const maxNumCountries = 512;
    const paletteTextureWidth = maxNumCountries;
    const paletteTextureHeight = 1;
    const palette = new Uint8Array(paletteTextureWidth * 4);
    const paletteTexture = new Three.DataTexture(
      palette,
      paletteTextureWidth,
      paletteTextureHeight
    );
    paletteTexture.minFilter = Three.NearestFilter;
    paletteTexture.magFilter = Three.NearestFilter;

    const selectedColor = get255BasedColor("red");
    const unselectedColor = get255BasedColor("#444");
    const oceanColor = get255BasedColor("rgb(100,200,255)");
    resetPalette();

    function setPaletteColor(index: number, color: number[]) {
      palette.set(color, index * 4);
    }

    function resetPalette() {
      for (let i = 0; i < maxNumCountries; i++) {
        setPaletteColor(i, unselectedColor);
      }
      setPaletteColor(0, oceanColor);
      paletteTexture.needsUpdate = true;
    }

    // for (let i = 0; i < palette.length; i++) {
    //   palette[i] = Math.random() * 256;
    // }
    // palette.set([100, 200, 255, 255], 0)

    {
      const loader = new Three.TextureLoader();
      const geometry = new Three.SphereGeometry(1, 64, 32);

      const indexTexture = loader.load(
        require("@/assets/imgs/country-index-texture.png")
      );
      indexTexture.minFilter = Three.NearestFilter;
      indexTexture.magFilter = Three.NearestFilter;

      const pickingMaterial = new Three.MeshBasicMaterial({
        map: indexTexture,
      });
      pickingScene.add(new Three.Mesh(geometry, pickingMaterial));

      const fragmentShaderReplacements = [
        {
          from: "#include <common>",
          to: `
            #include <common>
            uniform sampler2D indexTexture;
            uniform sampler2D paletteTexture;
            uniform float paletteTextureWidth;
          `,
        },
        {
          from: "#include <color_fragment>",
          to: `
            #include <color_fragment>
            {
              vec4 indexColor = texture2D(indexTexture, vUv);
              float index = indexColor.r * 255.0 + indexColor.g * 255.0 * 256.0;
              vec2 paletteUV = vec2((index + 0.5) / paletteTextureWidth, 0.5);
              vec4 paletteColor = texture2D(paletteTexture, paletteUV);
              // diffuseColor.rgb += paletteColor.rgb;   // white outlines
              diffuseColor.rgb = paletteColor.rgb - diffuseColor.rgb;  // black outlines
            }
          `,
        },
      ];

      const texture = loader.load(
        require("@/assets/imgs/country-outlines-4k.png")
      );
      const material = new Three.MeshBasicMaterial({ map: texture });
      material.onBeforeCompile = function (shader) {
        fragmentShaderReplacements.forEach(rep => {
          shader.fragmentShader = shader.fragmentShader.replace(
            rep.from,
            rep.to
          );
        });
        shader.uniforms.paletteTexture = { value: paletteTexture };
        shader.uniforms.indexTexture = { value: indexTexture };
        shader.uniforms.paletteTextureWidth = { value: paletteTextureWidth };
      };
      scene.add(new Three.Mesh(geometry, material));
    }

    let countryInfos: CountryInfo[] = [];
    let numCountriesSelected = 0;
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
        labelContainerElem?.appendChild(elem);
        countryInfo.elem = elem;

        countryInfo.selected = false;
      }
      requestRenderIfNotRequested();
    }
    loadCountryData();

    const tempV = new Three.Vector3();
    const cameraToPoint = new Three.Vector3();
    const cameraPosition = new Three.Vector3();
    const normalMatrix = new Three.Matrix3();
    const settings = {
      minArea: 16,
      maxVisibleDot: -0.2,
    };
    function updateLabels() {
      if (!countryInfos) return;

      normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
      camera.getWorldPosition(cameraPosition);

      for (const countryInfo of countryInfos) {
        const { position, elem, area, selected } = countryInfo;

        const large = settings.minArea * settings.minArea;
        const largeEnough = area >= large;
        const show = selected || (numCountriesSelected === 0 && largeEnough);
        if (!show) {
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

    const maxClickTimeMs = 200
    const maxMoveDeltaSq = 5 * 5
    const startPosition: any = {}
    let startTimeMs = 0;

    function recordStartTimeAndPosition(event: PointerEvent) {
      startTimeMs = performance.now()
      const pos = getCanvasRelativePosition(event)
      startPosition.x = pos.x;
      startPosition.y = pos.y;
    }

    function getCanvasRelativePosition(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * canvas.width) / rect.width,
        y: ((event.clientY - rect.top) * canvas.height) / rect.height,
      };
    }

    function pickCountry(event: PointerEvent) {
      if (!countryInfos) return;

      const clickTimeMs = performance.now() - startTimeMs
      if (clickTimeMs > maxClickTimeMs) {
        return
      }
      const position = getCanvasRelativePosition(event)
      const moveDeltaSq = (startPosition.x - position.x) ** 2 + (startPosition.y - position.y) ** 2;
      if (moveDeltaSq > maxMoveDeltaSq) return
      
      const id = pickHelper.pick(position, pickingScene, camera, renderer);
      if (id > 0) {
        const countryInfo = countryInfos[id - 1];
        const selected = !countryInfo.selected;
        if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          unselectedAllCountries();
        }
        numCountriesSelected += selected ? 1 : -1;
        countryInfo.selected = selected;
        setPaletteColor(id, selected ? selectedColor : unselectedColor);
        paletteTexture.needsUpdate = true;
      } else if (numCountriesSelected) {
        unselectedAllCountries();
      }
      requestRenderIfNotRequested();
    }

    function unselectedAllCountries() {
      numCountriesSelected = 0;
      countryInfos.forEach(info => {
        info.selected = false;
      });
      resetPalette()
    }

    canvas.addEventListener("pointerdown", recordStartTimeAndPosition);
    canvas.addEventListener("pointerup", pickCountry);

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

export default IndexedTextures;
