const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))

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