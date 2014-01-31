/************************************************************************************************************
 


 ************************************************************************************************************/




if (!window.JS) {
    window.JS = {};
}


JS.ImageBrowser = new Class({
    Extends:Events,


    autoplay:{
        buttons:{
            start:{
                txt:'',
                enabled:true
            },
            stop:{
                txt:'',
                enabled:true
            }
        },
        enabled:true,
        pause:3,
		rewind:true,
        initialPause:0.2,
        timestampLastIteration:0
    },

    preload:true,

    thumbs:{
        width:0, /* Measured automatically */
        height:0,
        noThumbsInView:0
    },

    images:[],
    dom:{
        el:null,
        thumbnailContainerParent:null,
        thumbnailContainer:null,
        enlargedImage:null,
        enlargedImages:{},
        loaderImages:{},
        activeEnlargedImage:{
            id:null,
            image:null,
            caption:null
        },
        autoplay:{
            start:null,
            stop:null
        }

    },

    currentZIndex:0,
    startIndex : 0,
    loadedPictures:{},
    loaderGif:'images/ajax-loader.gif',

    initialize:function (config) {
        if (config.listeners) {
            this.addEvents(config.listeners);
        }

        if (config.preload !== undefined) {
            this.preload = config.preload;
            if (config.loaderGif !== undefined) {
                this.loaderGif = config.loaderGif;
            }
        }
        if (config.autoplay !== undefined) {
            if (config.autoplay.enabled !== undefined) {
                this.autoplay.enabled = config.autoplay.enabled;
            }
            if (config.autoplay.pause) {
                this.autoplay.pause = config.autoplay.pause;
            }
            if (config.autoplay.rewind !== undefined) {
                this.autoplay.rewind = config.autoplay.rewind;
            }
            this.autoplay.initialPause = config.autoplay.initialPause || this.autoplay.initialPause;
            if (config.autoplay.buttons) {
                if (config.autoplay.buttons.start) {
                    if (config.autoplay.buttons.start.txt) {
                        this.autoplay.buttons.start.txt = config.autoplay.buttons.start.txt;
                    }
                    if (config.autoplay.buttons.start.enabled !== undefined) {
                        this.autoplay.buttons.start.enabled = config.autoplay.buttons.start.enabled;
                    }
                    if (config.autoplay.buttons.stop.txt) {
                        this.autoplay.buttons.stop.txt = config.autoplay.buttons.stop.txt;
                    }
                    if (config.autoplay.buttons.stop.enabled !== undefined) {
                        this.autoplay.buttons.stop.enabled = config.autoplay.buttons.stop.enabled;
                    }
                }

            }
        }
        this.startIndex = config.startIndex || 0;
        this.dom.el = config.el;

        this.getImages();
        this.storeThumbnailSize();
        this.initializeGallery();
    },

    initializeGallery: function() {

        this.createDomElements();

        if (this.preload) {
            this.preloadImages.delay(50, this);
        }

        this.storeNumberOfThumbnailsInView();
        this.selectImage(this.images[this.startIndex].id);

        if (this.autoplay.enabled) {
            this.updateAutoplayTimestamp();
            this.startAutoPlay();
        }
        this.doAutoPlay.delay(this.autoplay.initialPause * 200, this);

    },

    preloadImages:function () {
        var countImages = this.images.length;
        for (i = 0; i < countImages; i++) {
            Asset.image(this.images[i].src, {
                onLoad:this.getOnloadFunction(this.images[i].id)
            })
        }
    },

    getOnloadFunction:function (id) {
        return function () {
            this.loadedPictures[id] = true;
            if (this.dom.loaderImages[id]) {
                this.dom.loaderImages[id].dispose();
            }
        }.bind(this)
    },

    startAutoPlay:function () {
        this.autoplay.enabled = true;
        if (this.dom.autoplay.start) {
            this.dom.autoplay.start.addClass('image-browser-next-autoplay-start-off');
        }
        if (this.dom.autoplay.stop) {
            this.dom.autoplay.stop.removeClass('image-browser-next-autoplay-stop-off');
        }
    },
    stopAutoPlay:function () {
        this.autoplay.enabled = false;
        if (this.dom.autoplay.start) {
            this.dom.autoplay.start.removeClass('image-browser-next-autoplay-start-off');
        }
        if (this.dom.autoplay.stop) {
            this.dom.autoplay.stop.addClass('image-browser-next-autoplay-stop-off');
        }
    },
    doAutoPlay:function () {
        var d = new Date();
        if (this.autoplay.enabled && this.isReadyToContinueAutoplay()) {
            var index = this.getCurrentIndex();
            index++;
            if (index === this.images.length) {
				if(!this.autoplay.rewind){
					this.stopAutoPlay();
					return;
				}
                index = 0;
            }
            this.selectImage(this.images[index].id);
        }

        this.doAutoPlay.delay(200, this);
    },

    isReadyToContinueAutoplay:function () {
        var d = new Date();
        var timestamp = d.getTime();

        if (timestamp - this.autoplay.timestampLastIteration >= this.autoplay.pause * 1000) {
            this.updateAutoplayTimestamp();
            return true;
        }
        return false;
    },
    updateAutoplayTimestamp:function () {
        var d = new Date();
        var timestamp = d.getTime();
        this.autoplay.timestampLastIteration = timestamp;
    },
    storeThumbnailSize:function () {
        var el = new Element('div');

        el.setStyles({
            'position':'absolute',
            'visibility':'hidden'
        });
        document.id(document.body).adopt(el);
        el.addClass('image-browser-thumbnail');

        var widthProperties = ['width', 'margin-left', 'margin-right', 'padding-left', 'padding-right', 'border-left-width', 'border-right-width'];
        for (i = 0; i < widthProperties.length; i++) {
            this.thumbs.width += el.getStyle(widthProperties[i]).replace('px', '') / 1;
        }

        var heightProperties = ['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width'];
        for (i = 0; i < heightProperties.length; i++) {
            this.thumbs.height += el.getStyle(heightProperties[i]).replace('px', '') / 1;
        }
        el.destroy();
    },

    storeNumberOfThumbnailsInView:function () {
        var containerWidth = this.dom.thumbnailContainerParent.getStyle('width').replace('px', '');
        if (isNaN(containerWidth)) {
            containerWidth = this.dom.thumbnailContainerParent.getSize().x;
        }
        this.thumbs.noThumbsInView = Math.round(containerWidth / this.thumbs.width);
    },
    createDomElements:function () {
        this.createDomForThumbnails();
        this.createDomForThumbnailHighlight();
        this.createDomForArrows();
        this.createDomForAutoplay();
    },

    createDomForAutoplay:function () {
        if (this.autoplay.buttons.start.enabled || this.autoplay.buttons.stop.enabled) {
            var autoPlayParent = new Element('div');
            autoPlayParent.addClass('image-browser-next-autoplay-container');
            document.id(this.dom.el).adopt(autoPlayParent);
        }

        if (this.autoplay.buttons.start.enabled) {
            var el = this.dom.autoplay.start = new Element('div');
            el.addClass('image-browser-next-autoplay-start');
            el.addEvent('click', this.startAutoPlay.bind(this));
            el.set('html', this.autoplay.buttons.start.txt);
            autoPlayParent.adopt(el);
        }
        if (this.autoplay.buttons.stop.enabled) {
            el = this.dom.autoplay.stop = new Element('div');
            el.addClass('image-browser-next-autoplay-stop');
            el.addEvent('click', this.stopAutoPlay.bind(this));
            el.set('html', this.autoplay.buttons.stop.txt);
            autoPlayParent.adopt(el);
        }

    },

    createDomForThumbnails:function () {
        var el = this.dom.thumbnailContainerParent = new Element('div');
        el.addClass('image-browser-thumbnail-container');
        el.setStyles({
            height:this.thumbs.height,
            overflow:'hidden'
        });
        document.id(this.dom.el).adopt(el);

        this.dom.thumbnailContainer = new Element('div');
        this.dom.thumbnailContainer.addClass('image-browser-thumbnails');
        this.dom.thumbnailContainer.setStyles({
            height:this.thumbs.height,
            position:'absolute',
            left:'0px',
            top:'0px',
            width:(this.images.length * this.thumbs.width)
        });


        el.adopt(this.dom.thumbnailContainer);

        this.currentLeft = 0;
        Array.each(this.images, function (image) {
            var div = new Element('div');

            div.addClass('image-browser-thumbnail');
            div.setProperty('id', image.id);
            div.setStyles({
                'background-repeat':'no-repeat',
                'background-position':'center center',
                'background-image':'url(' + image.thumb + ')',
                'position':'absolute',
                'left':this.currentLeft,
                'cursor':'pointer'
            });
            this.currentLeft += this.thumbs.width;
            div.addEvent('click', this.clickOnThumbnail.bind(this));
            this.dom.thumbnailContainer.adopt(div);
        }, this);
    },

    createDomForThumbnailHighlight:function () {
        var el = this.dom.thumbnailHighlight = new Element('div');
        el.addClass('image-browser-thumbnail-highlight');
        document.id(this.dom.thumbnailContainerParent).adopt(el);
        el.setStyles({
            width:this.thumbs.width
                - el.getStyle('border-left-width').replace('px', '')
                - el.getStyle('border-right-width').replace('px', '')
                - el.getStyle('padding-left').replace('px', '')
                - el.getStyle('padding-right').replace('px', '')
                - el.getStyle('margin-left').replace('px', '')
                - el.getStyle('margin-right').replace('px', ''),
            height:this.thumbs.height
                - el.getStyle('border-top-width').replace('px', '')
                - el.getStyle('border-bottom-width').replace('px', '')
                - el.getStyle('padding-top').replace('px', '')
                - el.getStyle('padding-bottom').replace('px', '')
                - el.getStyle('margin-top').replace('px', '')
                - el.getStyle('margin-bottom').replace('px', ''),
            left:'0px',
            'z-index':100,
            position:'absolute'
        });
    },

    createDomForArrows:function () {
        var el = this.dom.arrowLeft = new Element('div');
        el.addClass('image-browser-previous');
        el.setStyles({
            'background-repeat':'no-repeat'
        });
        el.addEvent('click', this.previous.bind(this));
        el.addEvent('mouseover', this.arrowOn.bind(this));
        el.addEvent('mouseout', this.arrowOff.bind(this));
        document.id(this.dom.el).adopt(el);

        var el = this.dom.arrowRight = new Element('div');
        el.addClass('image-browser-next');
        el.setStyles({
            'background-repeat':'no-repeat'
        });

        el.addEvent('mouseover', this.arrowOn.bind(this));
        el.addEvent('mouseout', this.arrowOff.bind(this));
        el.addEvent('click', this.next.bind(this));
        document.id(this.dom.el).adopt(el);
    },
    arrowOn:function (e) {
        e.target.addClass(e.target.className.trim() + '-over');


    },
    arrowOff:function (e) {
        e.target.removeClass('image-browser-previous-over');
        e.target.removeClass('image-browser-next-over');
    },

    previous:function () {
        this.updateAutoplayTimestamp();
        var index = this.getCurrentIndex() - 1;
        if (index < 0) {
            index = this.images.length - 1;
        }
        this.selectImage(this.getIdByIndex(index));
    },
    next:function () {
        this.updateAutoplayTimestamp();
        var index = this.getCurrentIndex() + 1;
        if (index >= this.images.length) {
            index = 0;
        }

        this.selectImage(this.getIdByIndex(index));
    },
    getIdByIndex:function (index) {
        return this.images[index].id;
    },
    clickOnThumbnail:function (e) {
        this.updateAutoplayTimestamp();
        var id = e.target.id;
        this.selectImage(id);
    },

    getCurrentIndex:function () {
        return this.dom.activeEnlargedImage.index;
    },

    selectImage:function (id) {

        if (id == this.dom.activeEnlargedImage.id) {
            return;
        }

        var imageData = this.getImageDataById(id);

        if (!this.dom.enlargedImages[id]) {

            this.dom.enlargedImages[id] = {};
            var el = this.dom.enlargedImages[id].image = new Element('div');
            el.addClass('image-browser-enlarged-image');

            el.addEvent('click', this.clickOnLargeImageEvent.bind(this));
            document.id(this.dom.el).adopt(el);
            el.setStyles({
                'background-image':'url(' + this.getLargeImagePath(id) + ')',
                'background-repeat':'no-repeat',
                'opacity':0,
                'filter':'alpha(opacity=0)'
            });
            if (this.images[imageData.index].href) {
                el.setStyle('cursor', 'pointer');
                el.setProperty('href', this.images[imageData.index].href);
                el.addEvent('click', this.followLink.bind(this));
            }

            var el = this.dom.enlargedImages[id].caption = new Element('div');
            el.addClass('image-browser-caption');
            el.setStyles({
                'opacity':0,
                'filter':'alpha(opacity=0)'
            });
            el.set('html', imageData.caption);
            document.id(this.dom.el).adopt(el);
        }

        if (this.dom.activeEnlargedImage.id) {
            this.dom.activeEnlargedImage.image.fade('out');
            this.dom.activeEnlargedImage.caption.fade('out');
        }
        this.currentZIndex++;
        this.dom.enlargedImages[id].image.setStyle('z-index', this.currentZIndex);
        this.dom.enlargedImages[id].caption.setStyle('z-index', this.currentZIndex);
        this.dom.enlargedImages[id].image.fade('in');
        this.dom.enlargedImages[id].caption.fade('in');
        this.dom.activeEnlargedImage = {
            index:imageData.index,
            id:id,
            image:this.dom.enlargedImages[id].image,
            caption:this.dom.enlargedImages[id].caption
        };
        this.highlightAndMoveThumbnailIntoView();
    },

    followLink:function (e) {
        location.href = e.target.getProperty('href');
    },

    getLargeImagePath:function (id) {
        if (!this.loadedPictures[id] && this.loaderGif && this.preload) {

            this.dom.loaderImages = this.dom.loaderImages || {};
            var loader = this.dom.loaderImages[id] = new Element('img');
            loader.addEvent('load', function () {
                this.setStyles({
                    width:this.getSize().x,
                    height:this.getSize().y,
                    'margin-left':this.getSize().x / 2 * -1,
                    'margin-top':this.getSize().y / 2 * -1
                })
            });
            loader.setStyles({
                position:'absolute',
                left:'50%',
                top:'50%',
                'margin-left':'-110px',
                'margin-top':'-10px'
            });
            loader.setProperty('src', this.loaderGif);
            loader.addClass('JS-image-gallery-loader');
            this.dom.enlargedImages[id].image.adopt(loader);

        }
        return this.getImageDataById(id).src;
    },

    updateLargeImagePath:function (id) {
        this.dom.enlargedImages[id].image.src = this.getImageDataById(id).src;
    },
    clickOnLargeImageEvent:function () {
        var eventObj = {
            index:this.dom.activeEnlargedImage.index,
            caption:this.images[this.dom.activeEnlargedImage.index].caption,
            src:this.images[this.dom.activeEnlargedImage.index].src,
            href:this.images[this.dom.activeEnlargedImage.index].href,
            thumb:this.images[this.dom.activeEnlargedImage.index].thumb,
            id:this.images[this.dom.activeEnlargedImage.index].id
        }
        this.fireEvent('clickpicture', eventObj);
    },
    getIndexPositionOfHighlightDiv:function () {
        var posHighlight = document.id(this.dom.thumbnailHighlight).getStyle('left').replace('px', '') / 1;
        return Math.round(posHighlight / this.thumbs.width);
    },
    getIndexPositionOfActiveThumbnail:function () {

        var pos = document.id(this.dom.activeEnlargedImage.id).getStyle('left').replace('px', '') / 1 + this.dom.thumbnailContainer.getStyle('left').replace('px', '') / 1;
        return Math.round(pos / this.thumbs.width);
    },
    highlightAndMoveThumbnailIntoView:function () {

        var indexHighlight = this.getIndexPositionOfHighlightDiv();
        var indexThumb = this.getIndexPositionOfActiveThumbnail();

        var newPosStrip = this.dom.thumbnailContainer.getStyle('left');
        var newPosHighlight = indexThumb * this.thumbs.width;

        if (this.isLocatedAtFirstImageInSlideshow()) {
            newIndexHighlight = 0;
        } else if (this.isLocatedAtLastImageInSlideshow()) {
            newIndexHighlight = Math.min(this.thumbs.noThumbsInView - 1, this.images.length - 1);
        }
        else if (this.isLocatedBeyondRightEdgeOfView()) {
            newIndexHighlight = this.thumbs.noThumbsInView - 1;
        }
        else if (this.isLocatedAtLastThumbnailInView()) {
            newIndexHighlight = Math.min(this.thumbs.noThumbsInView - 1, indexThumb - 1);
        }
        else if (this.isLocatedAtFirstThumbnailInView()) {
            newIndexHighlight = 1;
        }
        else {
            newIndexHighlight = indexThumb;
        }


        newPosHighlight = newIndexHighlight * this.thumbs.width;
        newPosStrip = (0 - this.getCurrentIndex() + newIndexHighlight) * this.thumbs.width

        var myFx = new Fx.Tween(this.dom.thumbnailHighlight);
        myFx.start('left', this.dom.thumbnailHighlight.getStyle('left'), newPosHighlight);

        var myFx = new Fx.Tween(this.dom.thumbnailContainer);
        myFx.start('left', this.dom.thumbnailContainer.getStyle('left'), newPosStrip);

    },

    isLocatedBeyondRightEdgeOfView:function () {
        return this.getIndexPositionOfActiveThumbnail() > this.thumbs.noThumbsInView;
    },
    ifLocatedBeforeLeftEdgeOfView:function () {
        return this.getIndexPositionOfActiveThumbnail() < 0;
    },
    isLocatedAtFirstThumbnailInView:function () {
        return this.getIndexPositionOfActiveThumbnail() <= 0;
    },
    isLocatedAtLastThumbnailInView:function () {
        return this.getIndexPositionOfActiveThumbnail() >= this.thumbs.noThumbsInView - 1;
    },
    isLocatedAtFirstImageInSlideshow:function () {
        return this.getCurrentIndex() == 0;
    },
    isLocatedAtLastImageInSlideshow:function () {
        return this.getCurrentIndex() == this.images.length - 1;
    },
    getImageDataById:function (id) {
        var countImages = this.images.length;
        for (var i = 0; i < countImages; i++) {
            if (this.images[i].id == id) {
                return this.images[i];
            }
        }
    },

    getImages:function () {
        var imageObjects = $$('.image-browser-image');
        var countImages = imageObjects.length;

        for (var i = 0; i < countImages; i++) {
            var img = imageObjects[i];

            var linkEl = img.getElement('.image-browser-link');
            var href = linkEl ? linkEl.getProperty('href') : null;

            this.addImageToGallery({
                index : i,
                id: imageObjects[i].id,
                thumb : img.getElements('img')[0].src,
                caption : img.getElements('.image-browser-caption')[0].get('html').trim(),
                src : img.getElements('.image-browser-large-image-path')[0].get('html').trim(),
                href : href
            });
            /*
            this.images.push({
                index:i,
                id:imageObjects[i].id ? imageObjects[i].id : this.getUniqueId(),
                thumb:img.getElements('img')[0].src,
                caption:img.getElements('.dg-image-gallery-caption')[0].get('html').trim(),
                src:img.getElements('.dg-image-gallery-large-image-path')[0].get('html').trim(),
                href:href

            }); */
            img.dispose();
        }
    },

    addImageToGallery : function(imageConfig){
        this.images.push({
            index : this.images.length,
            id : imageConfig.id || this.getUniqueId(),
            thumb : imageConfig.thumb,
            caption : imageConfig.caption,
            src : imageConfig.src,
            href : imageConfig.href || null
        });
    },

    replace : function(images){
        this.images = [];
        for(var i=0;i<images.length;i++){
            this.addImageToGallery(images[i]);
        }

        $(this.dom.el).set('html', '');
        this.startIndex = 0;
        this.initializeGallery();
    },

    getUniqueId:function () {
        var ret = 'unique' + Math.random() + +Math.random();
        ret = ret.replace('.', '');
        return ret;
    }
});

