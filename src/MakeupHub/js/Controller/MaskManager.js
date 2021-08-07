import {INITIAL_MASK_PATH} from '../Model/Constants.js'

class MaskManager{
    constructor(painter, initialMaskPath = INITIAL_MASK_PATH){
        this.initial_mask = document.createElement('img');
        this.initial_mask.src = initialMaskPath;
        this.initial_mask.style.display = 'hidden';
        this.painter = painter;
        this.initial_mask.onload = () => this.painter.setCurrentMask(this.initial_mask);
    }

}
export {MaskManager};