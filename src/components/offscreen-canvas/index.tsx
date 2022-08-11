import { useRef, useEffect } from "react";
import Worker from "worker-loader!./worker";
import { WorkerFunName } from "./interface";

const OffscreenCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const canvas = canvasRef.current;
    // @ts-ignore
    if (canvas.transferControlToOffscreen !== null) {
      console.log("当前浏览器支持 OffscreenCanvas");
    } else {
      console.log("当前浏览器不支持 OffscreenCanvas");
    }

    // @ts-ignore
    const offscreen = canvas.transferControlToOffscreen();

    const worker = new Worker();
    worker.postMessage({ type: WorkerFunName.main, params: offscreen }, [
      offscreen,
    ]);

    const handleMessageError = (error: MessageEvent<any>) => {
      console.error(error);
    };
    const handleError = (error: ErrorEvent) => {
      console.error(error);
    };
    worker.addEventListener("messageerror", handleMessageError);
    worker.addEventListener("error", handleError);

    const handleResize = () => {
      worker.postMessage({
        type: WorkerFunName.updateSize,
        params: { width: canvas.clientWidth, height: canvas.clientHeight },
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      worker.removeEventListener("messageerror", handleMessageError);
      worker.removeEventListener("error", handleError);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);
  return <canvas ref={canvasRef} className="full-screen" />;
};

export default OffscreenCanvas;
