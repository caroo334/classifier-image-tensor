'use client'
import React, { useEffect, useRef } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableMachineImageModel = () => {
  const webcamRef = useRef(null);
  const labelContainerRef = useRef(null);
  let model, maxPredictions;

  // La URL de tu modelo proporcionada por Teachable Machine
  const URL = "/model/my-image-model/";

  // Carga el modelo de imagen y configura la webcam
  useEffect(() => {
    const init = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      // Carga el modelo y los metadatos
      // Consulta tmImage.loadFromFiles() en la API para admitir archivos desde el selector de archivos
      // o archivos desde tu disco duro local
      // Nota: la biblioteca "tmImage" agrega el objeto "tmImage" a tu ventana (window.tmImage)
      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      // Función de conveniencia para configurar la webcam
      const flip = true; // si se debe voltear la webcam
      webcamRef.current = new tmImage.Webcam(200, 200, flip); // ancho, alto, volteo
      await webcamRef.current.setup(); // solicita acceso a la webcam
      await webcamRef.current.play();
      window.requestAnimationFrame(loop);

      // agrega elementos al DOM
      document.getElementById("webcam-container").appendChild(webcamRef.current.canvas);
      labelContainerRef.current = document.getElementById("label-container");
      for (let i = 0; i < maxPredictions; i++) {
        // y etiquetas de clase
        labelContainerRef.current.appendChild(document.createElement("div"));
      }
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

  // ejecuta la imagen de la webcam a través del modelo de imagen
  const predict = async () => {
    // predict puede recibir una imagen, video o elemento canvas de HTML
    const prediction = await model.predict(webcamRef.current.canvas);
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
    }
  };

  return (
    <div>
      <div>Modelo de Imagen de Teachable Machine</div>
      <div id="webcam-container"></div>
      <div id="label-container"></div>
    </div>
  );
};

export default TeachableMachineImageModel;
