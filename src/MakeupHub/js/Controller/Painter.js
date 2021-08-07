import { Homography } from "../Controller/Homography.js";
import { getRectFromPointsBuffer } from "../Helpers/Utils.js"
const scale = 1;
const width = 640;
const height = 480;

const mask_width = 496;
const mask_height = 496;
class Painter{
    constructor(webcamCanvas){
        this.webcamCanvas = webcamCanvas;
        this.homography = new Homography("piecewiseaffine", width, height);
        this.srcPointsLength = null;

    }

    async paint(prediction, ){
        /*const [x, y] = boundingBox.topLeft;
        const width = boundingBox.bottomRight[0] - x;
        const height = boundingBox.bottomRight[1] - y;
        console.log(x, y, width, height);
        console.log("FROM PAINT", prediction);*/
        //Prepare the new dstPoints
        let dstPoints = new Float32Array(this.srcPointsLength*2);
        for (let i = 0; i<this.srcPointsLength; i++){
            dstPoints[(i*2)] = prediction[i][0];
            dstPoints[(i*2)+1] = prediction[i][1];
        }
        const boundingBox = getRectFromPointsBuffer(dstPoints);
        this.homography.setDestinyPoints(dstPoints);
        const img = await this.homography.warp();
        this.webcamCanvas.clearCanvas();
        /*for(let i=0; i<dstPoints.length; i+=2){
            this.webcamCanvas.drawPoint(dstPoints[i], dstPoints[i+1]);
        }*/
        this.webcamCanvas.putImageData(img, boundingBox.x, boundingBox.y);
        //this.webcamCanvas.drawImage(img, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)
    }

    addSrcPoints(srcPoints){
        //Iris are the last 10 marks and it corresponds with the scaledMesh of prediction
        this.srcPointsLength = srcPoints.length;
        let srcPointsScaled = new Float32Array(this.srcPointsLength*2);
        for (let i = 0; i<this.srcPointsLength; i++){
            srcPointsScaled[(i*2)] = srcPoints[i][0]*mask_width;
            srcPointsScaled[(i*2)+1] = srcPoints[i][1]*mask_height;
        }
        console.log(srcPointsScaled);
        this.homography.setSourcePoints(srcPointsScaled, null, mask_width, mask_height)
        
    }

    setCurrentMask(img){
        this.homography.setImage(img, width, height);
    }
}
export{Painter}