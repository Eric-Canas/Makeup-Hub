import { MAX_AXIS_SHAPE } from "../Model/Constants.js";

const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))

let hiddenCanvas = document.createElement('canvas');
let hiddenCanvasContext = hiddenCanvas.getContext("2d");

function getRectFromPointsBuffer(points){
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i < points.length; i++){
    const value = points[i];
    if (i%2 == 0){
      if (value < xMin) xMin = value;
      if (value > xMax) xMax = value;
    } else {
      if (value < yMin) yMin = value;
      if (value > yMax) yMax = value;
    }
  }
  return {x : xMin, y : yMin, width : xMax-xMin, height : yMax-yMin};
}
export {getRectFromPointsBuffer}

function cropImage(img, boundingBox, maxAxis=MAX_AXIS_SHAPE, getAsURL=true){
  const [adjustedWidth, adjustedHeight] = adjustedWidthHeightFromBoudingBox(boundingBox, maxAxis);
  hiddenCanvas.width = adjustedWidth;
  hiddenCanvas.height = adjustedHeight;
  hiddenCanvasContext.drawImage(img, boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height, 0, 0, adjustedWidth, adjustedHeight);
  if (getAsURL){
      return hiddenCanvas.toDataURL('image/png');
  } else {
    const photo = document.createElement('img');
    photo.src = hiddenCanvas.toDataURL('image/png');
    return new Promise((resolve, reject) => {
        photo.onload = () => {resolve(photo);};
        photo.onerror = reject;
    });
  }

}
export {cropImage};

function imgDataToDataURL(imgData){
  hiddenCanvas.width = imgData.width;
  hiddenCanvas.height = imgData.height;
  hiddenCanvasContext.putImageData(imgData, 0, 0);
  return hiddenCanvas.toDataURL('image/png');
}
export {imgDataToDataURL};

function dataURLToHTMLImgElement(img){
    const photo = document.createElement('img');
    photo.src = img;
    return new Promise((resolve, reject) => {
        photo.onload = () => {resolve(photo);};
        photo.onerror = reject;
    });
}
export {dataURLToHTMLImgElement};

function dataURLToImageData(imgURL){
  const photo = document.createElement('img');
  photo.src = img;
  return new Promise((resolve, reject) => {
      photo.onload = () => {resolve(photo);};
      photo.onerror = reject;
  });
}
export {dataURLToImageData};

function adjustedWidthHeightFromBoudingBox(boundingBox, maxAxis = MAX_AXIS_SHAPE){
  let adjustedWidth, adjustedHeight;
  if (boundingBox.width > boundingBox.height){
    adjustedWidth = maxAxis;
    adjustedHeight = maxAxis*(boundingBox.height/boundingBox.width);
  } else {
    adjustedHeight = maxAxis;
    adjustedWidth = maxAxis*(boundingBox.width/boundingBox.height);
  }
  return [Math.round(adjustedWidth), Math.round(adjustedHeight)];
}
export {adjustedWidthHeightFromBoudingBox};

function sumArrays(arr1, arr2){
  if (arr1.length !== arr2.length){
    throw(`Both arrays must have same shape to be fused. arr1 is ${arr1.length} but arr2 is ${arr2.length}`)
  }else{
    for(let i=0; i<arr1.length; i++){
      arr1[i] += arr2[i];
    }
  } 
}
export {sumArrays};


function mapValue(x, in_min, in_max, out_min = 0, out_max = 1) {
  x = x < in_min? in_min : x;
  x = x > in_max? in_max : x;
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
export {mapValue};

function pathJoin(parts, sep){
  var separator = sep || '/';
  var replace = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}

function saveFile(encodedHref, fileName='fileName.txt', type='text/plain', notOverride = true){
  let element = document.createElement("a");
  element.href = encodedHref;
  if (notOverride){
    const fileNameParts = fileName.split('.');
    if (fileNameParts.length != 2){
      throw "FileName error, unable to save data"
    }
    fileName = fileNameParts[0]+Math.floor(Math.random() * 999999999)+'.'+fileNameParts[1]
  }
  element.download = fileName;
  element.click();
}

function saveJSON(JSONObject, fileName='session.json', type='text/plain', notOverride = true){
  const file = new Blob([JSON.stringify(JSONObject)], {type: type});
  saveFile(URL.createObjectURL(file), fileName, type, notOverride)

}
export {saveJSON};