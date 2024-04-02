import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import draw from './utilities'
import { load as loadMobileNet } from '@tensorflow-models/mobilenet';
import "./App.css";
import axios from 'axios';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require('@tensorflow-models/blazeface')
  const capFaces = useRef(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
 const [distances, setDistances] = useState([]);

  const runFacedetection = async () => {

    try {
      //const model=await blazeface.load('/blazeface/model.json')
      const response = await axios.get("https://s2m5sd0p18.execute-api.eu-north-1.amazonaws.com/models_live/models")

      const model = await blazeface.load(response.data)


      detect(model);

    }
    catch (err) {
      console.log(err);
    }

  }

  const returnTensors = false;

  const detect = async (model) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections

      const predictions = await model.estimateFaces(video, returnTensors);

      setDetectedFaces(predictions);

      const ctx = canvasRef.current.getContext("2d");
      draw(predictions, ctx, capFaces)

    }

  }

  const handleClick = () => {
    capFaces.current = !capFaces.current
    runFacedetection();



  }


  const saveInDb = async () => {

    const res = await axios.post("https://br246fcf02.execute-api.eu-north-1.amazonaws.com/faceDB/faces", detectedFaces);

  }

  const compareFaces = async () => {
    // Define a threshold for face similarity
    console.log("compare faces")
    const SIMILARITY_THRESHOLD = 0.9;
    const facesInDatabase = await getFaces();
    // Let's assume we are comparing the first two faces detected
    console.log(facesInDatabase)

   

  

    facesInDatabase.forEach((face) => {
      const face1Landmarks = detectedFaces[0].landmarks;
      const face2Landmarks = face.landmarks;
    
      // Calculate the distance between the landmarks
      let distance = 0;
      for (let i = 0; i < face1Landmarks.length; i++) {
        const dx = face1Landmarks[i].x - face2Landmarks[i].x;
        const dy = face1Landmarks[i].y - face2Landmarks[i].y;
        distance += Math.sqrt(dx * dx + dy * dy);
      }
     console.log(distance)
      // Add the calculated distance to the array
      distances.push(distance);
    });
    console.log(distances)
    // Calculate average distance
    const averageDistance = distances.reduce((acc, curr) => acc + curr, 0) / distances.length;
    
    console.log(averageDistance);
    
    if (averageDistance < SIMILARITY_THRESHOLD) {
      console.log('Faces are similar.');
    } else {
      console.log('Faces are not similar.');
    }
    

    // Check if the faces are similar or not based on the threshold

  }

  const getFaces = async () => {
    const res = await axios.get("https://br246fcf02.execute-api.eu-north-1.amazonaws.com/faceDB/faces");

    // res.data.faces.map((face,index)=>{
    //   console.log(face.landmarks)
    // })

    return res.data.faces;
  }
  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          className='cam'
        />

        <canvas
          ref={canvasRef}
          className='canvas'

        />

        <button className='btn' onClick={handleClick}>Start Capturing</button>

        <button className='btn' onClick={compareFaces}>Compare</button>

        <button className='btn' onClick={saveInDb}>Save In Database</button>

      </header>
    </div>
  );

}
export default App;