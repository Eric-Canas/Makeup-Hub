import { Homography } from "../Controller/Homography.js";
import { MAX_AXIS_SHAPE } from "../Model/Constants.js";

const hiddenTools = ['crop', 'rotate', 'resize', 'open', 'zoomin', 'zoomout'];
class PaintManager{
    constructor(painter){
        this.painterro = Painterro({saveHandler : this.saveHandler.bind(this)});
        this.painter = painter
        this.maskTransformation = new Homography("piecewiseaffine");
    }

    open(imgURL=false, srcPoints=null, srcPointsZ=null, dstPoints=null, plainMaskTriangles=null){
        this.maskTransformation = new Homography("piecewiseaffine");
        this.maskTransformation.setTriangles(plainMaskTriangles);
        if(srcPoints === null||dstPoints === null){
            throw("You should give src and destiny points when opening painterro, in order to let it produce the plain mask drawn")
        } else {
            this.maskTransformation.setSourcePoints(srcPoints, null, null, null, false, srcPointsZ);
            this.maskTransformation.setDestinyPoints(dstPoints);
        }
        Painterro({saveHandler : this.saveHandler.bind(this), backplateImgUrl : imgURL, hiddenTools : hiddenTools,
                  initText : '<p> Draw on your face </p>'}).show();
    }

    saveHandler(image, done){
        const img = document.createElement('img');
        img.src = image.asDataURL();
        img.onload = async () =>{
            const plainMask = this.maskTransformation.warp(img, false, true);
            this.painter.setMask(plainMask);
            done(true);
        }
    }

}
export {PaintManager};