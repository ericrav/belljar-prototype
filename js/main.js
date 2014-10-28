var c = document.getElementById("canvas");
var text = document.getElementById("text");
var textContainer = document.getElementById("textContainer");
var help = document.getElementById("help");
var w = window.innerWidth;
var h = window.innerHeight;
var ready = true;

var scalar = 1;
if (window.devicePixelRatio) scalar = window.devicePixelRatio; // adjust for retina, etc
c.width = w * scalar;
c.height = h * scalar;
c.style.width = w + "px";
c.style.height = h + "px";

text.style.top = (h / 2) + 30; // put text in sort of center

// jar: 178 x 300
var jarWidth = 178;
var jarHeight = 300;

var context = c.getContext("2d");
context.scale(scalar, scalar);
var jar = new Image();
var jarCoords = [];
jar.onload = function () {
    var startX = Math.floor((w / 2) - (jarWidth / 2));
    var startY = Math.floor((h / 2) - (jarHeight / 2));
    context.drawImage(jar, startX, startY); // center it
    // get coords of bell jar for pixel perfect detection
    // console.log("one");
    // for (var x = startX; x < startX + jarWidth; x++) {
    //     for (var y = startY; y < startY + jarHeight; y++) {
    //         var color = context.getImageData(x,y, 1,1).data;
    //         if (color != [0,0,0,0] && color != [0,0,0]) jarCoords.push({x: x, y: y});
    //     }
    // }
    // console.log("two");
};

jar.src = 'belljar.png';

function writeText(message) {
    ready = false;
    textContainer.style.opacity = 0;
    text.style.letterSpacing = "6px"; // restore to defaults
    text.innerHTML = message;

    fadeInText();

    setTimeout(function () {
        fadeOutText(true);
    }, 5000);
    
}

function fadeInText() {
    var t = 0;
    var delta = 50;
    var limit = 350;
    var timer = setInterval(function () {
        var factor = Math.pow((t / limit), 2); // ease in
        textContainer.style.opacity = factor;
        t += delta;
        if (t >= limit) {
            textContainer.style.opacity = 1;
            clearInterval(timer);
        }
    }, delta);
}

function fadeOutText(expand) {
    var t = 0;
    var delta = 25;
    var limit = 1500;
    var spacingFactor;
    if (expand) spacingFactor = 15;
    else spacingFactor = -6; // shrink letter spacing
    // making its exit...
    var timer = setInterval(function () {
        var factor = Math.pow((t / limit), 2); // ease in
        textContainer.style.opacity = 1 - factor;
        text.style.letterSpacing = (6 + spacingFactor * factor) + "px";
        t += delta;
        if (t >= limit) {
            text.innerHTML = "";
            help.innerHTML = "";
            ready = true;
            clearInterval(timer);
        }
    }, delta);
}

var resizeTimer;
window.onresize = function (event) {
    clearInterval(resizeTimer);
    var shadow = document.getElementById("shadow");
    var count = document.getElementById("count");
    shadow.style.display = "block";
    count.style.color = "#aaaab9";
    count.innerHTML = "3.000";
    var t = 0;
    var delta = 17;
    var limit = 3000;
    resizeTimer = setInterval(function () {
        t += delta;
        count.innerHTML = t < limit ? parseFloat((limit - t) / 1000).toFixed(3) : "0.000";
        if (limit - t <= 1000) {
            count.style.color = "#C0392B"
        }
        if (t >= limit) {
            clearInterval(resizeTimer);
            location.reload();
        }
    }, delta)
}

writeText("BELL JAR");

document.onkeypress = function (e) {
    var key = e.keyCode;
    if (ready && text.innerHTML.length < 255 && key >= 32 && key <= 126) {
        help.innerHTML = "click outside the Bell Jar to deploy message."
        textContainer.style.opacity = 1;
        text.style.letterSpacing = "6px";
        text.innerHTML += String.fromCharCode(key);
    }
};