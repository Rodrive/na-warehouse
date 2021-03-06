'use strict';

function NavalMap(canvasId, imageMapUrl, imageCompassUrl, config) {
    this.canvas = document.getElementById(canvasId);
    this.imageMap = new Image();
    this.imageCompass = new Image();
    this.config = config;
    this.init(imageMapUrl, imageCompassUrl);
}

NavalMap.prototype.init = function init(imageMapUrl, imageCompassUrl) {
    var self = this;
    this.loadDataUrl(function () {
        self.loadImageMap(imageMapUrl, function () {
                self.loadImageCompass(imageCompassUrl, function () {
                    var stage = new createjs.Stage(canvas);
                    createjs.Touch.enable(stage);
                    stage.enableMouseOver(10);
                    self.map = new Map(self.canvas, stage, self.imageMap, self.imageCompass, self.config);

                })
            }
        )
    });
};

NavalMap.prototype.loadImageMap = function loadImageMap(url, cb) {
    this.imageMap.src = url;
    this.imageMap.onload = function () {
        if (cb) {
            cb();
        }
    };
};

NavalMap.prototype.loadImageCompass = function loadImageCompass(url, cb) {
    this.imageCompass.src = url;
    this.imageCompass.onload = function () {
        if (cb) {
            cb();
        }
    };
};

NavalMap.prototype.loadDataUrl = function loadDataUrl(cb) {
    $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json").done(
        $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Nations_cleanopenworldprodeu1.json").done(
            $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Shops_cleanopenworldprodeu1.json").done(
                $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Ports_cleanopenworldprodeu1.json").done(function () {
                        if (cb) {
                            cb();
                        }
                    }
                ))))
    ;
};

function Map(canvas, stage, imageMap, imageCompass, config) {
    this.canvas = canvas;
    this.config = config;
    this.stage = stage;
    this.mapContainer = new createjs.Container();
    this.portsContainer = new createjs.Container();
    this.unmodifiedMapContainer = {};
    this.compass = new Compass(imageCompass, config);
    this.lineShape = new createjs.Shape();
    this.line = this.lineShape.graphics;
    this.update = false;
    this.init(imageMap);
}

Map.prototype.init = function(imageMap) {
    this.stage.addChild(this.mapContainer);
    this.mapContainer.addChild(new createjs.Bitmap(imageMap));
    this.mapContainer.addChild(this.portsContainer);
    this.mapContainer.addChild(this.compass);
    this.mapContainer.addChild(this.lineShape);
    this.mapContainer.hasBeenDblClicked = false;
    this.createAllEvents();
    this.resizeCanvas();
    this.initContainerMap();
    this.addPorts();
    this.update = true;
};

Map.prototype.initContainerMap = function() {
    this.setScale(this.config.map.scale);
    this.centerTo(this.config.map.x, this.config.map.y);
    this.mapContainer.cursor = "default";
};

Map.prototype.setScale = function(scale) {
    this.mapContainer.scale = this.mapContainer.scaleX = this.mapContainer.scaleY = scale;
};

Map.prototype.zoom = function(increment) {
    this.setScale(this.mapContainer.scale + increment);
};

Map.prototype.addPorts = function() {
    var self = this;
    Ports.forEach(function (port, idx) {
        var circle = new createjs.Shape();
        circle.graphics.beginFill(self.config.color[port.Nation]).drawCircle(0, 0, 12);
        circle.x = (port.sourcePosition.x + self.config.portsOffset.x);
        circle.y = (port.sourcePosition.y + self.config.portsOffset.y);
        circle.cursor = "pointer";
        circle.idx = idx;
        circle.on("click", function (evt) {
            console.log('toto');
        });
        self.portsContainer.addChild(circle);
    });
};

Map.prototype.keepMapUnderPos = function(x, y) {
    var mapPos = this.getMapPosFromWindowPos(x, y);
    this.mapContainer.x = x - this.mapContainer.scale * mapPos.x;
    this.mapContainer.y = y - this.mapContainer.scale * mapPos.y;
};

Map.prototype.centerTo = function(x, y) {
    this.mapContainer.x = this.canvas.width / 2 - this.mapContainer.scale * x;
    this.mapContainer.y = this.canvas.height / 2 - this.mapContainer.scale * y;
};

Map.prototype.getMapPosFromWindowPos = function(x, y) {
    return {
        x: (x - this.unmodifiedMapContainer.x) / this.unmodifiedMapContainer.scale,
        y: (y - this.unmodifiedMapContainer.y) / this.unmodifiedMapContainer.scale
    };
};

Map.prototype.createAllEvents = function() {
    this.resizeCanvasEvent();
    this.mouseDownEvent();
    this.pressMoveEvent();
    this.pressUpEvent();
    this.dblClickEvent();
    this.mouseWheelEvent();
    this.tickEvent();
};

Map.prototype.dblClickEvent = function() {
    var self = this;
    this.mapContainer.on("dblclick", function (evt) {
        if(this.hasBeenDblClicked) {
            self.line.lineTo(evt.stageX, evt.stageY).endStroke();
            this.hasBeenDblClicked = false;
        } else {
            self.compass.x = (evt.stageX - self.compass.getTransformedBounds().width * self.mapContainer.scale / 2 - self.mapContainer.x) / self.mapContainer.scale;
            self.compass.y = (evt.stageY - self.compass.getTransformedBounds().height * self.mapContainer.scale / 2 - self.mapContainer.y) / self.mapContainer.scale;
            self.line.beginStroke('black').moveTo(evt.stageX, evt.stageY);
            this.hasBeenDblClicked = true;
        }
        self.update = true;
    });
};

Map.prototype.mouseDownEvent = function() {
    this.mapContainer.on("mousedown", function (evt) {
        this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
        this.cursor = "move";
    });
};

Map.prototype.pressMoveEvent = function() {
    var self = this;
    this.mapContainer.on("pressmove", function (evt) {
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        this.cursor = "move";
        self.update = true;
    });
};

Map.prototype.pressUpEvent = function() {
    var self = this;
    this.mapContainer.on("pressup", function (evt) {
        this.cursor = "default";
        self.update = true;
    });
};

Map.prototype.mouseWheelEvent = function() {
    var self = this;
    $('#canvas').mousewheel(function (event) {
        if (event.deltaY == 1) {
            self.zoom(0.1);
        } else if (event.deltaY == -1) {
            self.zoom(-0.1);
        }
        self.keepMapUnderPos(event.pageX, event.pageY);
        self.compass.keepSizeAndPos(self.unmodifiedMapContainer.scale, self.mapContainer.scale);
        self.update = true;
    });
};

Map.prototype.resizeCanvasEvent = function() {
    window.addEventListener('resize', this.resizeCanvas, false);
};

Map.prototype.resizeCanvas = function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.update = true;
};

Map.prototype.tickEvent = function() {
    var self = this;
    createjs.Ticker.addEventListener("tick", function(event) {
        if (self.update) {
            self.copyMapContainer();
            self.update = false; // only update once
            self.stage.update(event);
        }
    });
};

Map.prototype.copyMapContainer = function() {
    $.extend(true, this.unmodifiedMapContainer, this.mapContainer);
};

function Compass(imageCompass, config) {
    this.addChild(new createjs.Bitmap(imageCompass));
    this.setScale(config.compass.scale);
}
Compass.prototype = new createjs.Container();
Compass.prototype.constructor = Compass;

Compass.prototype.setScale = function(scale) {
    this.scale = this.scaleX = this.scaleY = scale;
};

Compass.prototype.keepSizeAndPos = function(oldScale, newScale) {
    var currentCenterX = this.getBounds().width * this.scale / 2;
    var currentCenterY = this.getBounds().height * this.scale / 2;
    this.setScale(this.scale * oldScale / newScale);
    var nextCenterX = this.getBounds().width * this.scale / 2;
    var nextCenterY = this.getBounds().height * this.scale / 2;
    this.x += currentCenterX - nextCenterX;
    this.y += currentCenterY - nextCenterY;
};