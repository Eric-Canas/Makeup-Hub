import { Homography } from "../Controller/Homography.js";
const userLanguage = ['ca', 'de', 'en', 'es', 'fa', 'fr', 'ja', 'pl', 'ru', 'nl'].includes((navigator.language || navigator.userLanguage).substring(0, 2))?
                                                                                           (navigator.language || navigator.userLanguage).substring(0, 2) : 'en';
const hiddenTools = ['crop', 'rotate', 'resize', 'open', 'zoomin', 'zoomout'];
const how_to_paste_actions = ['paste_over'];
const defaultTool = 'brush';
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
                   how_to_paste_actions : how_to_paste_actions, language : userLanguage, defaultTool : defaultTool,
                   saveByEnter : true, initText : '<p> Draw on your face </p>'}).show();
    }

    openMoon(imgURL=false){
        Painterro({saveHandler : this.moonSaveHandler.bind(this), backplateImgUrl : imgURL, hiddenTools : hiddenTools,
                   how_to_paste_actions : how_to_paste_actions, saveByEnter : true, language : userLanguage, defaultTool : defaultTool,
                   initText : '<p> Draw on your moonified face </p>'}).show();
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

    moonSaveHandler(image, done){
        const img = document.createElement('img');
        img.src = image.asDataURL();
        img.onload = async () =>{
            this.painter.setMask(img);
            done(true);
        }
    }

}
export {PaintManager};