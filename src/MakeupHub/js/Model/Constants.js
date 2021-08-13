/**
 * Copyright (c) 2021
 *
 * Summary. Defines the configuration for the project.
 * Description. Defines the constants that will be used through the project.
 *              In this way all the internal configuration is gathered here. 
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the constants of the project.
 * @since  0.0.1
 */

//HTML IDs
const WEBCAM_FRAME_ID = 'webcamFrame';
const WEBCAM_CANVAS_ID = 'webcamCanvas';
export {WEBCAM_CANVAS_ID, WEBCAM_FRAME_ID};

//Colors
const TRANSPARENT_RED = 'rgba(255, 99, 132, 0.4)';
const TRANSPARENT_BLUE = 'rgba(99, 132, 255, 0.4)';
const TRANSPARENT_WHITE = 'rgba(255, 255, 255, 0.4)'
export {TRANSPARENT_RED, TRANSPARENT_WHITE, TRANSPARENT_BLUE};

// Chart constants
const INVERT_Y_AXIS = false;
const INVERT_X_AXIS = true;
export {INVERT_Y_AXIS, INVERT_X_AXIS};


//FaceMesh constants
const CONFIDENCE_THRESHOLD = 0.5;
export {CONFIDENCE_THRESHOLD};


//Others
const EPSILON = 0.0001;
const ROUGH_EPSION = 0.0025;
export {EPSILON, ROUGH_EPSION};

const INITIAL_MASK_PATH = '../MakeupHub/js/Resources/mesh_map_resized.jpg';
const MAX_AXIS_SHAPE = 496*2;
export {INITIAL_MASK_PATH, MAX_AXIS_SHAPE};

const MOONIFY_CHECKBOX_ID = 'moonify';
const MOONIFY_SLIDER_ID = 'moonifySlider';
const MAKE_UP_BUTTON_ID = 'paint';
export {MOONIFY_CHECKBOX_ID, MOONIFY_SLIDER_ID, MAKE_UP_BUTTON_ID};