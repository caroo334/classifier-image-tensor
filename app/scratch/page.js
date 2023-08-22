'use client'
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';

const Scratch = () => {
    const webcamRef = useRef(null);
    const SIZE_W = 224;
    const SIZE_H = 224;
    
    const [modelo, setModelo] = useState(null);
    const [prediccion, setPrediccion] = useState([]);
    const CondimentosClasses = {
        0: 'Oregano',
        1: 'Provenzal',
      };

    const loadModelo = async () => {
        const loadedModel = await tf.loadLayersModel('/model/prueba1/my-image-model/model.json');

        setModelo(loadedModel);
    };

    useEffect(() => {
        loadModelo();
    }, []);

    useEffect(() => {
        if (modelo && webcamRef.current) {
            const interval = setInterval(() => {
                predicts();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [modelo]);

    const predicts = async () => {
        if (modelo && webcamRef.current) {
            const imageElement = webcamRef.current.video;

            if (imageElement.videoWidth > 0 && imageElement.videoHeight > 0) {
                const tensor = tf.browser
                    .fromPixels(imageElement)
                    .resizeNearestNeighbor([SIZE_W, SIZE_H])
                    .toFloat()
                    .div(tf.scalar(255.0))
                    .expandDims();

                const predictions = await modelo.predict(tensor).data();
                const top = Array.from(predictions)
                    .map((p, i) => ({ probability: p, className: CondimentosClasses[i] }))
                    .sort((a, b) => b.probability - a.probability)
                    .slice(0, 3);

                setPrediccion(top);
            }
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px' }}>
            <div>Tu modelo de imagen</div>
            <Webcam
                ref={webcamRef}
            />

            <div> {prediccion.map((p) => (
                <div key={p.className}>
                    <span style={{ color: 'white' }}>{p.className}: </span>
                    <span style={{ color: 'white' }}>{p.probability.toFixed(6)}</span>
                </div>
            ))}</div>
        </div>
    );
}
export default Scratch
