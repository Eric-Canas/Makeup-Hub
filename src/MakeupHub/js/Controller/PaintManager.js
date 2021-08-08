
const hiddenTools = ['crop', 'rotate', 'resize', 'open', 'zoomin', 'zoomout'];
class PaintManager{
    constructor(painter){
        this.painterro = Painterro({saveHandler : this.saveHandler.bind(this)});
        this.painter = painter
    }

    open(imgURL=false){
        Painterro({saveHandler : this.saveHandler.bind(this),backplateImgUrl : imgURL, hiddenTools : hiddenTools,
                  initText : '<p> Draw in your face </p>'}).show();
    }

    saveHandler(image, done){
        const img = document.createElement('img');
        img.src = image.asDataURL();
        this.painter.setMask(img);
        done(true);
    }

}
export {PaintManager};