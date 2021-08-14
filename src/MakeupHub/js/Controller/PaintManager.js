import { Homography } from "../Controller/Homography.js";
import {dataURLToHTMLImgElement, HTMLImageElementToImageURL, imgDataToDataURL} from "../Helpers/Utils.js"
const userLanguage = ['ca', 'de', 'en', 'es', 'fa', 'fr', 'ja', 'pl', 'ru', 'nl'].includes((navigator.language || navigator.userLanguage).substring(0, 2))?
                                                                                           (navigator.language || navigator.userLanguage).substring(0, 2) : 'en';
const hiddenTools = ['crop', 'rotate', 'resize', 'open', 'zoomin', 'zoomout'];
const how_to_paste_actions = ['paste_over'];
const defaultTool = 'brush';
class PaintManager{
    constructor(painter){
        this.painterro = Painterro({saveHandler : this.saveHandler.bind(this)});
        this.painter = painter
        this.currentMaskAsHTML = null;
        this.maskTransformation = new Homography("piecewiseaffine");
        this.plainToFaceTransformation = new Homography("piecewiseaffine");
        this.moonWidth = 488;
        this.moonHeigth = 420;

    }

    async open(imgURL=false, srcPoints=null, srcPointsZ=null, dstPoints=null, width=null, height=null, plainMaskTriangles=null){
        this.maskTransformation = new Homography("piecewiseaffine");
        this.maskTransformation.setTriangles(plainMaskTriangles);
        if(srcPoints === null||dstPoints === null){
            throw("You should give src and destiny points when opening painterro, in order to let it produce the plain mask drawn")
        }
        //const imgHTML = dataURLToHTMLImgElement(imgURL);
        this.maskTransformation.setSourcePoints(srcPoints, null, null, null, false, srcPointsZ);
        this.maskTransformation.setDestinyPoints(dstPoints);
        let transformedMask = null;
        if (this.currentMaskAsHTML !== null){
            console.log(this.currentMaskAsHTML);
            this.plainToFaceTransformation.setSourcePoints(dstPoints, this.currentMaskAsHTML, null, null, false);
            this.plainToFaceTransformation.setDestinyPoints(srcPoints);
            transformedMask = imgDataToDataURL(this.plainToFaceTransformation.warp(null,false, true));
        }

        Painterro({saveHandler : this.saveHandler.bind(this), /*backplateImgUrl : imgURL,*/ hiddenTools : hiddenTools,
                   how_to_paste_actions : how_to_paste_actions, language : userLanguage, defaultTool : defaultTool,
                   saveByEnter : true, initText : '<p> Draw on your face </p>', backgroundFillColorAlpha : 0.0,
                    defaultSize : `${width}x${height}`}).show(transformedMask);

        let sheet = window.document.styleSheets[0];
        sheet.insertRule(`.ptro-center-tablecell { background-image: url("${imgURL}");
                                                    background-repeat : no-repeat;
                                                    background-position: center center;
                                                    background-size = ${width}px ${height}px}`, sheet.cssRules.length);
}

    openMoon(imgURL=false){
        Painterro({saveHandler : this.moonSaveHandler.bind(this), /*backplateImgUrl : imgURL,*/ hiddenTools : hiddenTools,
                   how_to_paste_actions : how_to_paste_actions, saveByEnter : true, language : userLanguage, defaultTool : defaultTool,
                   initText : '<p> Draw on your moonified face </p>', backgroundFillColorAlpha : 0.0,
                   defaultSize : `${this.moonWidth}x${this.moonHeigth}`}).show(this.currentMask);
        
        let sheet = window.document.styleSheets[0];
        sheet.insertRule(`.ptro-center-tablecell { background-image: url("${imgURL}");
                                                   background-repeat : no-repeat;
                                                   background-position: center center;
                                                   background-size = ${this.moonWidth}px ${this.moonHeigth}px}`, sheet.cssRules.length);
        

    }

    async saveHandler(image, done){
        const img = document.createElement('img');
        img.src = image.asDataURL();
        img.onload = async () =>{
            const plainMask = await this.maskTransformation.warp(img, true, true);
            this.currentMaskAsHTML = await this.maskTransformation.warp(img, true, true);
            this.currentMask = HTMLImageElementToImageURL(this.currentMaskAsHTML)
            this.painter.setMask(plainMask);
            done(true);
        }
    }

    moonSaveHandler(image, done){
        const img = document.createElement('img');
        img.src = image.asDataURL();
        this.currentMask = image.asDataURL();
        this.currentMaskAsHTML = dataURLToHTMLImgElement(this.currentMask);
        img.onload = async () =>{
            this.painter.setMask(img);
            done(true);
        }
    }

}
export {PaintManager};