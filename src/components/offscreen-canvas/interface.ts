import { OffscreenCanvas } from "three";

export type CanvasSize = {
  width: number;
  height: number;
};

export enum WorkerFunName {
  main = "main",
  updateSize = "updateSize",
}

export type MessageData =
  | { type: WorkerFunName.main; params: OffscreenCanvas }
  | { type: WorkerFunName.updateSize; params: CanvasSize };
