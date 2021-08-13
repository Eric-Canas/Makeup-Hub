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
        this.webcamController.videoStream.addEventListener('loadeddata', this.predict.bind(this));
        this.faceMesh = null;
        this.painter = painter;
        this.painter.setFaceMeshController(this)
        this._load_faceMesh();
    }

    async _load_faceMesh(){
        const options = {maxFaces : 1, shouldLoadIrisModel : true}
        this.faceMesh = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, options); 
        //Iris are the last 10 marks and it corresponds with the scaledMesh of prediction
        this.painter.addSrcPoints(this.faceMesh.__proto__.constructor.getUVCoords());

    }
    
    async predict(){
        if (this.faceMesh !== null){
            const prediction = await this.faceMesh.estimateFaces({input: this.webcamController.videoStream});
            if (prediction.length > 0){ //&& prediction.faceInViewConfidence > CONFIDENCE_THRESHOLD
                await this.painter.paint(prediction[0].scaledMesh);
            }
            setTimeout(() => this.predict(), 0.1)
        } else {
            setTimeout(() => this.predict(), 500)
        }
    }

    async predictBoundingBoxFromImage(img){
        const prediction = await this.faceMesh.estimateFaces({input: img});
        if (prediction.length > 0){ //&& prediction.faceInViewConfidence > CONFIDENCE_THRESHOLD
            const [x, y] = prediction[0].boundingBox.topLeft;
            const width = prediction[0].boundingBox.bottomRight[0] - x;
            const height = prediction[0].boundingBox.bottomRight[1] - y;
            return [prediction[0].scaledMesh, {x : x, y : y, width : width, height : height}];
        } else {
            return [null, null];
        }
    }

}

export {FaceMeshController};