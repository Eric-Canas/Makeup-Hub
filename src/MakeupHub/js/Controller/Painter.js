import {Homography} from "../Controller/Homography.js";
import {getRectFromPointsBuffer, cropImage, adjustedWidthHeightFromBoudingBox,
         sumArrays, dataURLToHTMLImgElement, imgDataToDataURL} from "../Helpers/Utils.js";
import {PaintManager} from "../Controller/PaintManager.js";
import {MOONIFY_CHECKBOX_ID, MOONIFY_SLIDER_ID, MAKE_UP_BUTTON_ID} from "../Model/Constants.js"

const scale = 1;
const width = 640;
const height = 480;

const mask_width = 496;
const mask_height = 496;
class Painter{
    constructor(webcamCanvas){
        this.webcamCanvas = webcamCanvas;
        this.faceMeshController = null;
        this.plainMaskPoints = null;
        this.plainMaskTriangles = null;
        this.homography = new Homography('piecewiseaffine');
        this.inverseHomography = new Homography('piecewiseaffine');
        this.moonifyHomography = new Homography('piecewiseaffine');
        this.pointsLength = null;
        this.paintManager = new PaintManager(this);
        this.normalizedMoonPoints = null;
        this.actualMoonPoints = null;
        this.dstPoints = null;
        this.currentSrcPonts = null;
        this.moonifyCheckbox = document.getElementById(MOONIFY_CHECKBOX_ID);
        this.moonify = this.moonifyCheckbox.checked;
        this.moonifySlider = document.getElementById(MOONIFY_SLIDER_ID);
        this.moonifyRatio = this.moonifySlider.value;
        this.moonifyCheckbox.onchange = this.onchangeMoonifiedCheckbox.bind(this);
        this.moonifySlider.onchange = this.onchangeMoonifiedSlider.bind(this);
        this.currentMoonifyDstPoints = null;
        document.getElementById(MAKE_UP_BUTTON_ID).onclick = this.openPaint.bind(this, null, false);
        document.getElementById('moonifiedPaint').onclick = this.openPaint.bind(this, null, true);
    }

    onchangeMoonifiedCheckbox(){
        const moonify = this.moonifyCheckbox.checked;
        this.moonifySlider.disabled = !moonify;
        if (moonify)
            this.moonifyRatio = this.moonifySlider.value;
        
        // Set at the last moment for avoiding to apply the change until all the variables are modified.
        this.moonify = moonify;
    }

    onchangeMoonifiedSlider(){
        this.moonifyRatio = this.moonify.value;
    }
    async paint(prediction, drawPoints = false){
        if (this.moonify){
            this.paintOverMoonifiedFace(prediction, drawPoints);
        } else {
            this.paintOverFace(prediction, drawPoints);
        }
    }

    async paintOverFace(prediction, drawPoints = false){
        const boundingBox = this.fillDstPointsAndGetBoundingBox(prediction, false);
        this.homography.setDestinyPoints(this.dstPoints);
        const img = this.homography.warp(null, false, true);
        this.webcamCanvas.clearCanvas();
        this.webcamCanvas.putImageData(img, boundingBox.x , boundingBox.y);
        if (drawPoints){
            for(let i=0; i<this.dstPoints.length; i+=2){
                this.webcamCanvas.drawPoint(this.dstPoints[i]+boundingBox.x, dstPoints[i+1]+boundingBox.y, 1, 'blue');
            }
        }
    }

    async paintOverMoonifiedFace(prediction, drawPoints = false){
        const boundingBox = this.fillDstPointsAndGetBoundingBox(prediction);
        //I must reshape it to something big
        const face = this.webcamCanvas.webcam.takeSubPictureAsImageData(boundingBox,496);
        const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox,496);
        for (let i=0; i<this.dstPoints.length; i+=2){
            this.dstPoints[i] = (this.dstPoints[i]/boundingBox.width)*adjustedWidth;
            this.dstPoints[i+1] = (this.dstPoints[i+1]/boundingBox.height)*adjustedHeight;
        }
        //this.moonifyHomography = new Homography("piecewiseaffine");
        this.moonifyHomography.setSourcePoints(this.dstPoints, face, adjustedWidth, adjustedHeight, false);
        this.moonifyHomography.setDestinyPoints(this.actualMoonPoints, false)
        
        const img = this.moonifyHomography.warp(null, false, true);
        this.webcamCanvas.clearCanvas();
        this.webcamCanvas.putImageData(img, boundingBox.x/2 , boundingBox.y/2);
        if (drawPoints){
            for(let i=0; i<this.dstPoints.length; i+=2){
                this.webcamCanvas.drawPoint(this.dstPoints[i]+boundingBox.x, dstPoints[i+1]+boundingBox.y, 1, 'blue');
            }
        }
        //this.webcamCanvas.drawImage(img, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)
    }

    async openPaint(event, moonified = false){
        const [photo, detections, detectionsZ] = await this.captureCroppedFace(true);
        if(photo !== null){
            if (moonified){
                const moonFace = await dataURLToHTMLImgElement(photo);
                this.inverseHomography.setSourcePoints(detections, moonFace, null, null, false, detectionsZ);
                this.paintManager.openMoon(imgDataToDataURL(this.inverseHomography.warp(null, false, true)));
            } else {
                    this.paintManager.open(photo, detections, detectionsZ, this.plainMaskPoints, this.plainMaskTriangles);
            }
        }
    }

    async captureCroppedFace(returnPrediction = true){
        const img = await this.webcamCanvas.webcam.takePicture(false);
        let [prediction, boundingBox] = await this.faceMeshController.predictBoundingBoxFromImage(img);
        if (returnPrediction){
            if (boundingBox === null) return [null, null, null];
            const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox);
            let dstPoints = new Float32Array(this.pointsLength*2);
            let dstPointsZ = new Float32Array(this.pointsLength);
            for (let i = 0; i<this.pointsLength; i++){
                dstPoints[(i*2)] = ((prediction[i][0]-boundingBox.x)/boundingBox.width)*adjustedWidth;
                dstPoints[(i*2)+1] = ((prediction[i][1]-boundingBox.y)/boundingBox.height)*adjustedHeight;
                dstPointsZ[i] = prediction[i][2];
            }
            return [await cropImage(img, boundingBox), dstPoints, dstPointsZ];
        } else {
            if (boundingBox === null) return null;
            return await cropImage(img, boundingBox);
        }
    }

    setFaceMeshController(faceMeshController){
        this.faceMeshController = faceMeshController;
    }

    addSrcPoints(srcPoints){
        //Iris are the last 10 marks and it corresponds with the scaledMesh of prediction
        this.pointsLength = srcPoints.length;
        this.normalizedMoonPoints = new Float32Array(srcPoints.flat())
        this.actualMoonPoints = new Float32Array(this.pointsLength*2);
        this.dstPoints = new Float32Array(this.pointsLength*2);
        const boundingBox = this.rescaleActualMoonPointsAndGetBoundingBox(mask_width, mask_height)
        this.plainMaskPoints = new Float32Array(this.actualMoonPoints);
        // Initialize a fully transparent mask with size width*height*RGBA channels.
        const initialImage = new ImageData(new Uint8ClampedArray(boundingBox.width*boundingBox.height*4), boundingBox.width, boundingBox.height);
        this.homography.setSourcePoints(this.plainMaskPoints, initialImage, boundingBox.width, boundingBox.height, false);
        this.inverseHomography.setDestinyPoints(this.plainMaskPoints, false);
        this.moonifyHomography.setDestinyPoints(this.actualMoonPoints, false)
        this.plainMaskTriangles = this.homography._triangles;
        this.plainMaskBoundingBox = boundingBox;
    }

    setMask(img){
        if (ArrayBuffer.isView(img.data)){
            sumArrays(this.homography._image, img.data);
        } else {
            this.homography.setImage(img);
        }
    }

    fillDstPointsAndGetBoundingBox(prediction, calculateWidthHeight = true){
        let boundingBoxX = Infinity, boundingBoxY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i<this.pointsLength; i++){
            this.dstPoints[(i*2)] = prediction[i][0];
            this.dstPoints[(i*2)+1] = prediction[i][1];
            if (this.dstPoints[(i*2)] < boundingBoxX) boundingBoxX = this.dstPoints[(i*2)];
            if (this.dstPoints[(i*2)+1] < boundingBoxY) boundingBoxY = this.dstPoints[(i*2)+1];
            if (calculateWidthHeight && this.dstPoints[(i*2)] > maxX) maxX = this.dstPoints[(i*2)];
            if (calculateWidthHeight && this.dstPoints[(i*2)+1] > maxY) maxY = this.dstPoints[(i*2)+1];
        }
        for (let i = 0; i<this.dstPoints.length; i+=2){
            this.dstPoints[i] -= boundingBoxX;
            this.dstPoints[i+1] -= boundingBoxY;
        }
        return {x : boundingBoxX, y : boundingBoxY, width : maxX-boundingBoxX, height : maxY-boundingBoxY};
    }

    rescaleActualMoonPointsAndGetBoundingBox(width, height, calculateWidthHeight = true){
        let boundingBoxX = Infinity, boundingBoxY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i<this.pointsLength*2; i+=2){
            this.actualMoonPoints[i] = Math.round(this.normalizedMoonPoints[i]*width);
            this.actualMoonPoints[i+1] = Math.round(this.normalizedMoonPoints[i+1]*height);
            if (this.actualMoonPoints[i] < boundingBoxX) boundingBoxX = this.actualMoonPoints[i];
            if (this.actualMoonPoints[i+1] < boundingBoxY) boundingBoxY = this.actualMoonPoints[i+1];
            if (calculateWidthHeight && this.actualMoonPoints[i] > maxX) maxX = this.actualMoonPoints[i];
            if (calculateWidthHeight && this.actualMoonPoints[i+1] > maxY) maxY = this.actualMoonPoints[i+1];
        }
        for (let i = 0; i<this.pointsLength*2; i+=2){
            this.actualMoonPoints[i] -= boundingBoxX;
            this.actualMoonPoints[i+1] -= boundingBoxY;
        }
        
        return {x : boundingBoxX, y : boundingBoxY, width : maxX-boundingBoxX, height : maxY-boundingBoxY};
    }
}
export{Painter}