var canvas = document.getElementById("heatmap");
var radarCanvas = document.getElementById("radar");
var radarContext = radarCanvas.getContext("2d");
var container = document.getElementById("heat-container");
var w = window.innerWidth;
var h = window.innerHeight;

var help = document.getElementById("help");

var mainCanvas = document.getElementById("canvas");
var mainContext = mainCanvas.getContext("2d");

// paramaters
var count = 270;
var spread = 100;
var size = 19;
var intensity = 6;

// object that contains last coords of connected peers
var peers = {};
// generate user id
var user = "user";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// add random characters to generate string
for( var i=0; i < 20; i++ ) user += possible.charAt(Math.floor(Math.random() * possible.length));
console.log(user);




var scalar = 1;
if (window.devicePixelRatio) scalar = window.devicePixelRatio; // adjust for retina, etc
canvas.width = w * scalar;
canvas.height = h * scalar;
canvas.style.width = w + "px";
canvas.style.height = h + "px";
radarCanvas.width = w * scalar;
radarCanvas.height = h * scalar;
radarCanvas.style.width = w + "px";
radarCanvas.style.height = h + "px";

radarContext.scale(scalar, scalar);

var centerX = Math.floor(w / 2);
var centerY = Math.floor(h / 2);

// Enable pusher logging - don't include this in production
// Pusher.log = function(message) {
//     if (window.console && window.console.log) {
//       window.console.log(message);
//   }
// };

var pusher = new Pusher('2dae9bdea284ffd241a6', { authEndpoint: 'http://belljar-prototype-server.appspot.com/pusher/auth' });
var channel = pusher.subscribe('private-belljar');
channel.bind('client-mousemove', function(data) {
    peers[data.user] = {x: data.x + centerX, y: data.y + centerY};
    if (data.x + centerX >= 0 && data.y + centerY >= 0) paintAtCoordPeer(data.x + centerX, data.y + centerY);
});
channel.bind('client-message', function(data) {
    writeText(data.message);
});

function drawCircle(x, y, r, color, ctx) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
}

var radarOn = false;
var radarX, radarY, radarRadius;
var radarMax = 260;
var radarColor = "rgba(231, 76, 60, "; // broken string. opacity and ) must be appended

function radar(x, y) {
    radarOn = true;
    radarX = x;
    radarY = y;
    radarRadius = 1;
}

function drawRadarCircle() {
    radarContext.clearRect (0 , 0, w, h);
    if (radarOn && radarRadius <= radarMax) {
        drawCircle(radarX, radarY, radarRadius, radarColor + (1 - radarRadius/radarMax) + ")", radarContext);
        radarRadius += 2;
    } else {
        radarOn = false;
    }

    window.webkitRequestAnimationFrame(drawRadarCircle);
}

window.webkitRequestAnimationFrame(drawRadarCircle);

try {
    // taken from library's example
    var heatmap = createWebGLHeatmap({canvas: canvas});

    container.appendChild(heatmap.canvas);

    var paintAtCoord = function(x, y){
        var i = 0;
        while(i < count){
            var xoff = Math.random()*2-1;
            var yoff = Math.random()*2-1;
            var l = xoff*xoff + yoff*yoff;
            if(l > 1){
                continue;
            }
            var ls = Math.sqrt(l);
            xoff/=ls; yoff/=ls;
            xoff*=1-l; yoff*=1-l;
            i += 1;
            heatmap.addPoint(x+xoff*spread, y+yoff*spread, size, intensity/1000);
        }
    }

    var paintAtCoordPeer = function(x, y){
        var count = 570;
        var spread = 120;
        var size = 21;
        var intensity = 11;
        var i = 0;
        while(i < count){
            var xoff = Math.random()*2-1;
            var yoff = Math.random()*2-1;
            var l = xoff*xoff + yoff*yoff;
            if(l > 1){
                continue;
            }
            var ls = Math.sqrt(l);
            xoff/=ls; yoff/=ls;
            xoff*=1-l; yoff*=1-l;
            i += 1;
            heatmap.addPoint(x+xoff*spread, y+yoff*spread, size, intensity/1000);
        }
    }

    // check if coords are in bell jar image
    var backgroundTimer;
    var insideBellJar = false;
    function checkMouseOverBellJar(x, y) {
        var startX = Math.floor((w / 2) - (jarWidth / 2));
        var startY = Math.floor((h / 2) - (jarHeight / 2));
        var colorFragment = "rgba(35,35,35,";
        var yBuffer = 20;
        if (x > startX && x < startX + jarWidth && y > startY + yBuffer && y < startY + jarHeight) {
            if (!insideBellJar) {
                clearInterval(backgroundTimer); // if left over animation;
                insideBellJar = true; // don't repeat animation
                mainCanvas.style.background = colorFragment + "0)";
                // adjust help message
                if (text.innerHTML.length && ready) {
                    help.innerHTML = "click inside the Bell Jar to cancel message.";
                }
                // animate in background
                var opacity = mainCanvas.style.background.replace(/^.*,(.+)\)/,'$1') || 0; // get current rgba alpha
                var delta = 20, limit = 1000;
                var t = Math.pow(parseFloat(opacity), 1/3) * limit; // get starting time based on current alpha
                backgroundTimer = setInterval(function () {
                    if (t >= limit) {
                        mainCanvas.style.background = colorFragment + "1)";
                        clearInterval(backgroundTimer);
                        return;
                    }
                    mainCanvas.style.background = colorFragment + Math.pow((t / limit), 3) + ")";
                    t += delta;
                }, delta);
            }
        } else {
            if (insideBellJar) {
                clearInterval(backgroundTimer); // if left over animation;
                insideBellJar = false;
                // adjust help message
                if (text.innerHTML.length && ready) {
                    help.innerHTML = "click outside the Bell Jar to deploy message.";
                }
                var opacity = mainCanvas.style.background.replace(/^.*,(.+)\)/,'$1');
                var delta = 20, limit = 1000;
                var t = Math.pow(1 - parseFloat(opacity), 1/3) * limit; // get starting time based on current alpha 
                if (opacity > 1) t = 0;
                console.log(t + " : " + opacity);
                backgroundTimer = setInterval(function () {
                    if (t >= limit) {
                        mainCanvas.style.background = colorFragment + "0)";
                        clearInterval(backgroundTimer);
                        return;
                    }
                    mainCanvas.style.background = colorFragment +  (1 - Math.pow((t / limit), 3)) + ")";
                    t += delta;
                }, delta);
                
            }
        }
    }

    // event handling
    var onTouchMove = function(evt){
        evt.preventDefault();
        var touches = evt.changedTouches;
        for(var i=0; i<touches.length; i++){
            var touch = touches[i];
            paintAtCoord(touch.pageX, touch.pageY);
        }
    };
    canvas.addEventListener("touchmove", onTouchMove, false);

    canvas.onmousemove = function(event){
        var x = event.offsetX || event.clientX;
        var y = event.offsetY || event.clientY;

        checkMouseOverBellJar(x, y);
        paintAtCoord(x, y);
        try {
            var triggered = channel.trigger('client-mousemove', { user: user, x: x - centerX, y: y - centerY });
        } catch(e) {
            console.log(e);
        }
        console.log(triggered);
            
    }
    canvas.onclick = function(event){
        console.log(event);
        var x = event.offsetX || event.clientX;
        var y = event.offsetY || event.clientY;
        // send message
        if (text.innerHTML.length && ready) {
            if (insideBellJar) { // cancel message if clicked inside bell jar
                help.innerHTML = "canceled.";
                ready = false;
                fadeOutText(false);
            } else { // send message to location outside bell jar
                help.innerHTML = "deploying...";
                ready = false;
                var triggered = channel.trigger('client-message', { user: user, message: text.innerHTML, x: x, y: y });
                fadeOutText(true);
            }
        } else {
            radar(x, y);
        }
    }

    // paintAtCoord(50, 50);
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var update = function(){
        //heatmap.addPoint(100, 100, 100, 10/255);
        // heatmap.adjustSize(); // can be commented out for statically sized heatmaps, resize clears the map
        heatmap.update(); // adds the buffered points
        heatmap.multiply(0.998);
        heatmap.display(); // adds the buffered points
        //heatmap.blur();
        //heatmap.clamp(0.0, 1.0); // depending on usecase you might want to clamp it
        raf(update);
    }
    raf(update);

} catch(error){
    console.log(error);
}

