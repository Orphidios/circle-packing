/**
 Optimized event handler.
 Used for the Resize Even 
 https://developer.mozilla.org/en-US/docs/Web/Events/resize
*/
(function() {
    var throttle = function(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();

var Canvas = (function() {
    'use strict';

    // Constructor
    // id, width, height, target, scaleMode, autoResize
    /*
    options {
        id : 
        width :
        height :
        target :
        scaleMode :
        autoResize :
    }
    */
    function Canvas(id, options) {
        // enforces new
        if (!(this instanceof Canvas)) {
            return new Canvas(width, height, id);
        }

        // Info
        this.id = id;
        this.target = options.target || null;
        this.autoResize = options.autoResize || false;

        // Logical size
        this.width = options.width || this.target.clientWidth;
        this.height = options.height || this.target.clientHeight;
        this.ratio = this.width / this.height;

        // Create the canvas to the stage
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');
        this.element.id = id;
        this.element.width = this.width;
        this.element.height = this.height;
        this.element.autoResize = this.autoResize;

        if (options.target) {
            // Add canvas to target
            this.target.appendChild(this.element);

            // Set physical size with scale mode
            this.scaleMode = null;
            if (options.scaleMode)
                this.setScaleMode(options.scaleMode);
            else
                this.setScaleMode('ScaleToFit');

            // If autoResize lisen the optimizedResize of window and re applyScale.
            // Also dispatch canvasresize event.
            if (this.autoResize) {
                var self = this;
                var resizeEvent = new CustomEvent('canvasresize', {
                    "detail": { 'canvas': self.element }
                });
                window.addEventListener("optimizedResize", function() {
                    self.applyScaleMode();
                    self.element.dispatchEvent(resizeEvent);
                });
            }
        }
    }

    // PRIVATE ATTRIBUTES
    var SCALEMODE = ['ScaleToFill', 'ScaleToFit', 'StretchToFill', 'TopLeft', 'Center', 'FillTarget'];

    Canvas.prototype.clear = function(color, alpha) {
        if (color) {
            this.context.fillStyle = color;
            if (!!alpha)
                this.context.globalAlpha = alpha;
            this.context.fillRect(0, 0, this.width, this.height);
            if (!!alpha)
                this.context.globalAlpha = 1;
        } else {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    };

    Canvas.prototype.clearRect = function(x, y, w, h) {
        this.context.clearRect(x, y, w, h);
    };

    Canvas.prototype.setScaleMode = function(scaleMode) {
        if (scaleMode == this.scaleMode)
            return;
        // Check if the required scalemode is valide.
        if (SCALEMODE.indexOf(scaleMode) == -1) {
            console.error(scaleMode, ' is an invalide scaleMode');
            return;
        }
        // Set canvas scalemode.
        this.scaleMode = scaleMode;
        // Apply it.
        this.applyScaleMode();
    };

    Canvas.prototype.applyScaleMode = function() {
        var width, height, scale, bottom, left;

        // Target Size
        var targetWidth = this.target.clientWidth;
        var targetHeight = this.target.clientHeight;
        var targetRatio = targetWidth / targetHeight;

        switch (this.scaleMode) {
            case 'FillTarget':
                this.width = this.target.clientWidth;
                this.height = this.target.clientHeight;
                this.ratio = this.width / this.height;
                this.element.width = this.width;
                this.element.height = this.height;
            case 'TopLeft':
            case 'Center':
                scale = 1;
                width = this.width;
                height = this.height;
                if (this.scaleMode == "Center") {
                    bottom = (targetHeight - this.height) / 2 + 'px';
                    left = (targetWidth - this.width) / 2 + 'px';
                }
                break;
            case 'StretchToFill':
                width = targetWidth;
                height = targetHeight;
                scale = 1;
                break;
            case 'ScaleToFit':
            case 'ScaleToFill':
                if ((targetRatio > this.ratio) == (this.scaleMode == "ScaleToFit")) {
                    width = targetHeight * this.ratio;
                    height = targetHeight;
                } else {
                    width = targetWidth;
                    height = targetWidth / this.ratio;
                }
                scale = height / this.height;
                bottom = (targetHeight - height) / 2 + 'px';
                left = (targetWidth - width) / 2 + 'px';
                break;
        }
    };

    // Extend CanvasRenderingContext2D

    CanvasRenderingContext2D.prototype.underlineText = function(text, x, y, size, color, thickness, offset) {
        var width = this.measureText(text).width;

        switch (this.textAlign) {
            case "center":
                x -= (width / 2);
                break;
            case "right":
                x -= width;
                break;
        }

        switch (this.textBaseline) {
            case "alphabetic":
                y += offset;
                break;
            case "middle":
                y += offset;
                break;
        }

        this.beginPath();
        this.strokeStyle = color;
        this.lineWidth = thickness;
        this.moveTo(x, y);
        this.lineTo(x + width, y);

        this.stroke();
    };

    return Canvas;
}());