import React, { useRef, useState } from "react";
import DatGui, { DatButton } from "react-dat-gui";
import useCreateScene from "./use-create-scene";
import "./index.scss";
import '../../../node_modules/react-dat-gui/dist/index.css'

const HelloCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [date, setDate] = useState<any>({});

  const renderRef = useCreateScene(canvasRef);

  const handleGUIUpdate = (newDate: any) => {
    setDate(newDate);
  };

  const handleSaveClick = () => {
    if (canvasRef.current === null || renderRef.current === null) {
      return;
    }
    const canvas = canvasRef.current;
    renderRef.current();

    // toDataURL()
    const imgurl = canvas.toDataURL('image/jpeg', 0.8)
    const a = document.createElement('a')
    a.href = imgurl;
    a.download = 'myimg.jpeg';
    a.click()

    // toBlob()
    // canvas.toBlob(blob => {
    //   const imgurl = window.URL.createObjectURL(blob as Blob)
    //   const a = document.createElement('a')
    //   a.href = imgurl;
    //   a.download = 'myimg.jpeg';
    //   a.click()
    // }, 'image/jpeg', 0.8)
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
