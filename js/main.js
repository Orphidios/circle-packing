window.param = {
    'minRadius':5,
    'maxRadius':500,
};

window.myCanvas = new Canvas('main', {
    'autoResize': true,
    'target': document.getElementById('game'),
    'scaleMode': 'FillTarget',
});

window.mainWidth = myCanvas.width;
window.mainHeight = myCanvas.height;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomGrey () {
  var letters = '0123456789ABCDEF';
  var color = '#';
  var duet = '';
  for (var i = 0; i < 2; i++) {
    duet += letters[Math.floor(Math.random() * 16)];
  }
  color +=duet+duet+duet;
  return color;
}

function getRandomTint (baseTint) {
    var variation = 3*Math.random();
    return 'rgb('+(baseTint[0]*variation|0)+', '+(baseTint[1]*variation|0)+', '+(baseTint[2]*variation|0)+')';
}


Circle = function() {
    this.reset();
};

Circle.prototype.reset = function() {
    this.x = Math.random() * window.mainWidth | 0;
    this.y = Math.random() * window.mainHeight | 0;
    this.r = param.minRadius + Math.pow(Math.random(), 2) * param.maxRadius | 0;
};

Circle.prototype.draw = function(ctx, baseTint) {
    if (this.r > 60)
        ctx.fillStyle = '#000';
    else
        ctx.fillStyle = getRandomTint(baseTint);
    ctx.beginPath(this.x, this.y);
    ctx.closePath();
    ctx.arc(this.x, this.y, this.r, 0, 7);
    ctx.fill();
};

Circle.prototype.isValid = function(circle_list) {
    var c1, c2, dx, dy, dist;
    c1 = this;
    for (var i = 0; i < circle_list.length; i++) {
        c2 = circle_list[i];
        dx = c1.x - c2.x;
        dy = c1.y - c2.y;
        dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < c2.r + c1.r )
            return false;
    }
    return true;
};

window.commonCircle = [];
window.commonCircle.push(new Circle());
window.commonCircle.push(new Circle());
window.commonCircle.push(new Circle());

Layer = function() {
    this.baseTint = [Math.random()*125|0, Math.random()*125|0, Math.random()*125|0];
    this.circle_list = [];
    this.circle_list.push(window.commonCircle[0]);
    this.circle_list.push(window.commonCircle[1]);
    this.circle_list.push(window.commonCircle[2]);
    this.canvas = new Canvas('layer_canvas', {
        width: mainWidth,
        height: mainHeight
    });
};

Layer.prototype.fill = function() {
    for (var j = 0; j < 75; j++) {
        var circle = new Circle();
        var counter = 0;

        while(!circle.isValid(this.circle_list)) {
            circle.reset();
            counter++;
            if(counter > 10000)
                return;
        }

        circle.r -= 3;
        circle.draw(this.canvas.context, this.baseTint);

        this.circle_list.push(circle);
    }
};




var layers = [];

function loop () {
    myCanvas.clear();
    for (var i = 0; i < layers.length; i++) {
        layers[i].fill();
        myCanvas.context.drawImage(layers[i].canvas.element, 0, 0);
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    for (var i = 0; i < 2; i++) {
        layer = new Layer();
        layers.push(layer);
    }
    myCanvas.context.globalCompositeOperation = 'destination-atop';
    // myCanvas.context.globalCompositeOperation = 'lighter';
    loop();
};
