'use client'
import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableMachineImageModel = () => {
  const webcamRef = useRef(null);
//   const labelContainerRef = useRef(null);
  let model, maxPredictions;

  const URL = "/model/my-image-model/";

  const [showOreganoMessage, setShowOreganoMessage] = useState(false);
  const [showCominoMessage, setShowCominoMessage] = useState(false);

  useEffect(() => {
    const init = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcamRef.current = new tmImage.Webcam(400, 400, flip); // ancho, alto, volteo
      await webcamRef.current.setup(); // solicita acceso a la webcam
      await webcamRef.current.play();
      window.requestAnimationFrame(loop);

      document.getElementById("webcam-container").appendChild(webcamRef.current.canvas);
    //   labelContainerRef.current = document.getElementById("label-container");
    //   for (let i = 0; i < maxPredictions; i++) {
    //     // y etiquetas de clase
    //     labelContainerRef.current.appendChild(document.createElement("div"));
    //   }
    };

    init();

    return () => {
      // Limpia la webcam y el modelo cuando el componente se desmonta
      webcamRef.current.stop();
    };
  }, []);

  const loop = () => {
    webcamRef.current.update(); // actualiza el fotograma de la webcam
    predict();
    window.requestAnimationFrame(loop);
  };

  const predict = async () => {
    const prediction = await model.predict(webcamRef.current.canvas);
    for (let i = 0; i < maxPredictions; i++) {
      let className = prediction[i].className;
      if (className === "Class 1") {
        className = "oregano";
        setShowOreganoMessage(prediction[i].probability > 0.99);
      } else if (className === "Class 2") {
        className = "comino";
        setShowCominoMessage(prediction[i].probability > 0.50);
      }
    //   const classPrediction = className + ": " + prediction[i].probability.toFixed(2);
    //   labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px'}}>
      <div>Detectando condimentos</div>
      <div id="webcam-container" style={{marginTop: '15px'}}></div>
      {showOreganoMessage && <h1>Habemus oregano</h1>}
      {showCominoMessage && <h1>Habemus comino</h1>}
      {/* <div id="label-container"></div> */}
    </div>
  );
};

export default TeachableMachineImageModel;

