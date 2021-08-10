import { Homography } from "../Controller/Homography.js";
import { getRectFromPointsBuffer, cropImage, adjustedWidthHeightFromBoudingBox, sumArrays } from "../Helpers/Utils.js";
import { PaintManager } from "../Controller/PaintManager.js";

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
        this.homography = new Homography("piecewiseaffine");
        this.srcPointsLength = null;
        this.paintManager = new PaintManager(this);
        this.dstPoints = null;
        document.getElementById('paint').onclick = this.openPaint.bind(this);
        

    }
    /*
    async lunify(prediction, drawPoints = false){
        const img = await this.webcamCanvas.webcam.takePicture(false);
        let [prediction, boundingBox] = await this.faceMeshController.predictBoundingBoxFromImage(img);
        if (returnPrediction){
            if (boundingBox === null) return [null, null, null];
            const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox);
            let dstPoints = new Float32Array(this.srcPointsLength*2);
            let dstPointsZ = new Float32Array(this.srcPointsLength);
            for (let i = 0; i<this.srcPointsLength; i++){
                dstPoints[(i*2)] = ((prediction[i][0]-boundingBox.x)/boundingBox.width)*adjustedWidth;
                dstPoints[(i*2)+1] = ((prediction[i][1]-boundingBox.y)/boundingBox.height)*adjustedHeight;
                dstPointsZ[i] = prediction[i][2];
            }
            return [await cropImage(img, boundingBox), dstPoints, dstPointsZ];
        } else {
            if (boundingBox === null) return null;
            return await cropImage(img, boundingBox);
        }
    }*/

    async paint(prediction, drawPoints = false){
        for (let i = 0; i<this.srcPointsLength; i++){
            this.dstPoints[(i*2)] = prediction[i][0];
            this.dstPoints[(i*2)+1] = prediction[i][1];
        }
        const boundingBox = getRectFromPointsBuffer(this.dstPoints);
        for (let i = 0; i<this.srcPointsLength; i++){
            this.dstPoints[(i*2)] -= boundingBox.x;
            this.dstPoints[(i*2)+1] -= boundingBox.y;
        }
        this.homography.setDestinyPoints(this.dstPoints);
        const img = this.homography.warp(null, false, true);
        this.webcamCanvas.clearCanvas();
        this.webcamCanvas.putImageData(img, boundingBox.x, boundingBox.y);
        if (drawPoints){
            for(let i=0; i<dstPoints.length; i+=2){
                this.webcamCanvas.drawPoint(dstPoints[i]+boundingBox.x, dstPoints[i+1]+boundingBox.y, 1, 'blue');
            }
        }
        //this.webcamCanvas.drawImage(img, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)
    }

    async openPaint(){
        const [photo, detections, detectionsZ] = await this.captureCroppedFace(true);
        if(photo !== null){
            this.paintManager.open(photo, detections, detectionsZ, this.plainMaskPoints, this.plainMaskTriangles);
        }
    }

    async captureCroppedFace(returnPrediction = true){
        const img = await this.webcamCanvas.webcam.takePicture(false);
        let [prediction, boundingBox] = await this.faceMeshController.predictBoundingBoxFromImage(img);
        if (returnPrediction){
            if (boundingBox === null) return [null, null, null];
            const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox);
            let dstPoints = new Float32Array(this.srcPointsLength*2);
            let dstPointsZ = new Float32Array(this.srcPointsLength);
            for (let i = 0; i<this.srcPointsLength; i++){
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
        this.srcPointsLength = srcPoints.length;
        let srcPointsScaled = new Float32Array(this.srcPointsLength*2);
        for (let i = 0; i<this.srcPointsLength; i++){
            srcPointsScaled[(i*2)] = Math.round(srcPoints[i][0]*mask_width);
            srcPointsScaled[(i*2)+1] = Math.round(srcPoints[i][1]*mask_height);
        }
        const boundingBox = getRectFromPointsBuffer(srcPointsScaled);
        for (let i = 0; i<this.srcPointsLength*2; i+=2){
            srcPointsScaled[i] -= boundingBox.x;
            srcPointsScaled[i+1] -= boundingBox.y;
        }
        this.plainMaskPoints = srcPointsScaled;
        const initialImage = new ImageData(new Uint8ClampedArray(boundingBox.width*boundingBox.height*4), boundingBox.width, boundingBox.height);
        this.homography.setSourcePoints(this.plainMaskPoints, initialImage, boundingBox.width, boundingBox.height, false)
        this.plainMaskTriangles = this.homography._triangles;
        this.plainMaskBoundingBox = boundingBox;
        this.dstPoints = new Float32Array(this.srcPointsLength*2);
    }

    setMask(img){
        sumArrays(this.homography._image, img.data);
    }
}
export{Painter}