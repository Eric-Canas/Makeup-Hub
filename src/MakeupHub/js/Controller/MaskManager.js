import {INITIAL_MASK_PATH} from '../Model/Constants.js'

class MaskManager{
    constructor(painter, initialMaskPath = INITIAL_MASK_PATH){
        this.painter = painter;
    }

}
export {MaskManager};