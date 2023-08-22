'use client'
import React, { useEffect, useRef } from 'react';
import * as tmImage from '@teachablemachine/image';

const TeachableMachineComponent = () => {
    const webcamRef = useRef(null);
    const labelContainerRef = useRef(null);
    let model, webcam, labelContainer, maxPredictions;
    // Load the image model and setup the webcam
    const init = async () => {
        const URL = "/model/prueba1/my-image-model/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true;
        webcam = new tmImage.Webcam(200, 200, flip);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        if (webcamRef.current) {
            webcamRef.current.appendChild(webcam.canvas);
        }

        labelContainer = labelContainerRef.current;
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    };

    const loop = async () => {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
    };

    const predict = async () => {
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    };

    useEffect(() => {
        init();
        return () => {
            webcam.stop();
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px' }}>
            <div>Teachable Machine Image Model</div>
            <div ref={webcamRef}></div>
            <div ref={labelContainerRef}></div>
        </div>
    );
};

export default TeachableMachineComponent;
