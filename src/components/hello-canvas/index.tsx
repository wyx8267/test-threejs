import React, { useEffect, useRef, useState } from "react";
import DatGui, { DatButton } from "react-dat-gui";
import useCreateScene from "./use-create-scene";
import "./index.scss";
import '../../../node_modules/react-dat-gui/dist/index.css'

const HelloCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [date, setDate] = useState<any>({});

  useCreateScene(canvasRef);

  const handleGUIUpdate = (newDate: any) => {
    setDate(newDate);
  };

  const handleSaveClick = () => {
    //编写点击之后的代码
  };

  return (
    <div className="full-screen">
      <canvas ref={canvasRef} className="full-screen" />
      <DatGui data={date} onUpdate={handleGUIUpdate} className="dat-gui">
        <DatButton label="点击保存画布快照" onClick={handleSaveClick} />
      </DatGui>
    </div>
  );
};

export default HelloCanvas;
