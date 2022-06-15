import { useEffect, useRef } from "react";
import * as Three from "three";
import imgSrc from "@/assets/imgs/mapping.jpg";

const HelloTexture: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    const camera = new Three.PerspectiveCamera(40, 2, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xcccccc);

    const loader = new Three.TextureLoader();
    const material = new Three.MeshBasicMaterial({
      map: loader.load(
        imgSrc,
        texture => {
          console.log("纹理图片加载完成");
          console.log(texture);
          console.log(texture.image.currentSrc); //此处即图片实际加载地址
        },
        event => {
          console.log("纹理图片加载中...");
          console.log(event);
        },
        error => {
          console.log("纹理图片加载失败！");
          console.log(error);
        }
      ),
    });

    const box = new Three.BoxGeometry(8, 8, 8);
    const mesh = new Three.Mesh(box, material);
    scene.add(mesh);

    const render = (time: number) => {
      time = time * 0.001;
      // mesh.rotation.x = time;
      mesh.rotation.y = time / 3;
      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const resizeHandle = () => {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };

    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloTexture;
