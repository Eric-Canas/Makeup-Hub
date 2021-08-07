/**
 * Copyright (c) 2021
 *
 * Summary. Manages the loading and estimations of the Hands Network
 * Description. The HandPoseController class is in charge of loading the Hands model,
 *              from the mediapipe hub, and constantly estimate a hands position from the current
 *              frame of the given videoStream. Additionally, every time that a hand is detected,
 *              it executes the set of callbacks passed as argument in the constructor.
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the HandPoseController class.
 * @since  0.0.1
 */
import {CONFIDENCE_THRESHOLD} from '../Model/Constants.js'

class FaceMeshController{
    /**
     * 
     * 
     * @param {WebcamController} webcamController  : Controller of the webcam. Containing the videoStream information as well as other 
     *                                               webcam parameters such as the width and height of the video captured.
     * @param {Array} callbacksOnPoseCaptured : Array of callbacks containing the functions that must be triggered
     *                                          every time that a gabd is captured. Those callbacks must receive
     *                                          as first argument an array representing all 21 the [x, y, z] vectors 
     *                                          for every hand landmark.
     */
    constructor(webcamController, painter){
        this.webcamController = webcamController;
        this.faceMesh = null;
        this.painter = painter;
        this._load_faceMesh();
    }

    async _load_faceMesh(){
        const options = {maxFaces : 1, shouldLoadIrisModel : true}
        this.faceMesh = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, options); 
        //Iris are the last 10 marks and it corresponds with the scaledMesh of prediction
        this.painter.addSrcPoints(this.faceMesh.__proto__.constructor.getUVCoords());
        this.webcamController.videoStream.addEventListener('loadeddata', () => document.getElementById('capture').addEventListener("click", this.predict.bind(this)));
    }
    
    async predict(){
        const prediction = await this.faceMesh.estimateFaces({input: this.webcamController.videoStream});
        if (prediction.length > 0){ //&& prediction.faceInViewConfidence > CONFIDENCE_THRESHOLD
            this.painter.paint(prediction[0].scaledMesh);
        }
    }

}

export {FaceMeshController};