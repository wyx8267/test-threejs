import * as Three from "three";

class GPUPickHelper {
  pickingTexture: Three.WebGLRenderTarget;
  pixelBuffer: Uint8Array;
  constructor() {
    this.pickingTexture = new Three.WebGLRenderTarget(1, 1);
    this.pixelBuffer = new Uint8Array(4);
  }

  pick(
    cssPosition: { x: number; y: number },
    scene: Three.Scene,
    camera: Three.PerspectiveCamera,
    renderer: Three.WebGLRenderer,
  ) {
    const { pickingTexture, pixelBuffer } = this;

    const pixelRatio = renderer.getPixelRatio();
    camera.setViewOffset(
      renderer.getContext().drawingBufferWidth,
      renderer.getContext().drawingBufferHeight,
      (cssPosition.x * pixelRatio) | 0,
      (cssPosition.y * pixelRatio) | 0,
      1,
      1
    );

    renderer.setRenderTarget(pickingTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    camera.clearViewOffset();

    renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);

    const id = (pixelBuffer[0] << 0) | (pixelBuffer[1] << 8) | (pixelBuffer[2] << 16);
    return id
  }
}

export default GPUPickHelper;
