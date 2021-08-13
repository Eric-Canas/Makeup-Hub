/**
 * Copyright (c) 2021
 *
 * Summary. Controls the webcam.
 * Description. Controls the webcam. It allows to access to the videoStream and its information
 *              (width, height, framerate...).
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the WebcamController class.
 * @since  0.0.1
 */
import {MAX_AXIS_SHAPE, WEBCAM_FRAME_ID} from "../Model/Constants.js";
import {adjustedWidthHeightFromBoudingBox} from "../Helpers/Utils.js"

class WebcamController{
    constructor(videoID=WEBCAM_FRAME_ID){
        this.videoStream = document.getElementById(videoID);
        this.hiddenCanvas = document.createElement('canvas');
        this.hiddenCanvasContext = this.hiddenCanvas.getContext('2d');
        if (navigator.mediaDevices.getUserMedia) {
            this.webcamPromise = navigator.mediaDevices.getUserMedia({ video: true, audio : false});
            this.webcamPromise.then(stream => this.videoStream.srcObject = stream)
                              .catch(error => this._noWebcamAccessError(error));
        
        this.width = 1;
        this.height = 1;
        this.videoStream.addEventListener('loadedmetadata', this.updateVideoParameters.bind(this), false);
        } else {
            this.webcamPromise = null;
        }
    }
    
    _noWebcamAccessError(error){
        this.webcamPromise = null;
        this.videoStream.srcObject = null;
        alert(`Impossible to access to the camera :( --> ${error}`);
    }

    updateVideoParameters(){
        this.width = this.videoStream.videoWidth;
        this.height = this.videoStream.videoHeight;
        this.hiddenCanvas.width = this.width;
        this.hiddenCanvas.height = this.height;
    }

    takeSubPictureAsImageData(boundingBox, maxAxis=MAX_AXIS_SHAPE){
        const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox, maxAxis);
        if (this.hiddenCanvas.width < adjustedWidth) this.hiddenCanvas.width = adjustedWidth;
        if (this.hiddenCanvas.height < adjustedHeight) this.hiddenCanvas.height = adjustedHeight;
        this.hiddenCanvasContext.drawImage(this.videoStream, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
                                           0, 0, adjustedWidth, adjustedHeight);
        return this.hiddenCanvasContext.getImageData(0, 0, adjustedWidth, adjustedHeight);
    }
    takePicture(getAsURL = true){
        this.hiddenCanvasContext.drawImage(this.videoStream, 0, 0, this.width, this.height);
        if (getAsURL){
            return this.hiddenCanvas.toDataURL('image/png');
        }else{
            const photo = document.createElement('img');
            photo.src = this.hiddenCanvas.toDataURL('image/png');
        
            return new Promise((resolve, reject) => {
                photo.onload = () => {resolve(photo);};
                photo.onerror = reject;
            });
        }
    }
}
export {WebcamController};