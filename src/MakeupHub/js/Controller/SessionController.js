/**
 * Copyright (c) 2021
 *
 * Summary. Controls all the logic for managing the exercise that is being performed as well as
 *          the transitions between exercises.
 * Description. Controls all the logic for managing the exercise that is being performed as well as
 *              the transitions between exercises.
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the ExerciseController class.
 * @since  0.0.1
 */

 import {WebcamController} from "../Controller/WebcamController.js";
 import {WebcamCanvas} from "../View/WebcamCanvas.js";
 import {FaceMeshController} from "../Controller/FaceMeshController.js";
 import {Painter} from '../Controller/Painter.js';
 import {MaskManager} from '../Controller/MaskManager.js'


 class SessionController{
    //To avoid the creation of diverse SessionControllers, it is a singleton
    static instance;

    constructor(){
        if (this.constructor.instance){
            return instance
        } else {
            // ----------------------- WEBCAM CONTROLLER -------------------------------
            this.webcamController = new WebcamController();
            // --------------------------- VIEWS ---------------------------------------
            this.webcamCanvas = new WebcamCanvas(this.webcamController);
            this.painter = new Painter(this.webcamCanvas);
            this.maskManager = new MaskManager(this.painter);
            this.faceMeshController = new FaceMeshController(this.webcamController, this.painter);
            
            this.constructor.instance = this
        }
    }

    
    endSession(){
        this.poseNetController.disable();
        this.webcamCanvas.canvas.style.background = "black"
    }
    


}

export {SessionController};