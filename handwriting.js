var canvasWidth = Math.min(800, $(window).width() - 20);
var canvasHeight = canvasWidth;

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var isMouseDown = false;
var lastLoc = { x: 0, y: 0 };
var lastTimeStamp = 0;
var lastLineWidth = -1;
var strokeColor = 'black';

canvas.width = canvasWidth;
canvas.height = canvasHeight;
$('#controller').css('width', canvasWidth + 'px');

function drawGrid() {
    context.save();
    context.strokeStyle = "rgb(230, 11, 9)";
    context.beginPath();

    context.moveTo(3, 3);
    context.lineTo(canvasWidth - 3, 3);
    context.lineTo(canvasWidth - 3, canvasHeight - 3);
    context.lineTo(3, canvasHeight - 3);
    context.closePath();

    context.lineWidth = 6;
    context.stroke();

    context.beginPath();
    context.moveTo(3, 3);
    context.lineTo(canvasWidth - 3, canvasHeight - 3);

    context.moveTo(canvasWidth - 3, 3);
    context.lineTo(3, canvasHeight - 3);

    context.moveTo(0, canvasHeight / 2)
    context.lineTo(canvasWidth, canvasHeight / 2);

    context.moveTo(canvasWidth / 2, 0);
    context.lineTo(canvasWidth / 2, canvasHeight);

    context.lineWidth = 1;
    context.stroke();
    context.restore();
}

function windowToCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
        x: Math.round(x - bbox.left),
        y: Math.round(y - bbox.top)
    }
}

function calcDistance(loc1, loc2) {
    return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y));
}

var maxLineWidth = Number($('#size_input').val()) || 30,
    minLineWidth = 1,
    maxStrokeV = maxLineWidth / 3,
    minStrokeV = 0.1,
    lastStrokeP = 2 / 3,
    curStrokeP = 1 / 3;

function calcLineWidth(t, s) {
    maxLineWidth = Number($('#size_input').val()) || 30;
    maxStrokeV = maxLineWidth / 3;
    var v = s / t;
    var resultLineWidth;
    if (v <= minStrokeV) {
        resultLineWidth = maxLineWidth;
    } else if (v >= maxStrokeV) {
        resultLineWidth = minLineWidth;
    } else {
        resultLineWidth = maxLineWidth - (v - minStrokeV) / (maxStrokeV - minStrokeV) * (maxLineWidth - minLineWidth);
    }
    if (lastLineWidth == -1) {
        return resultLineWidth;
    }
    return lastLineWidth * lastStrokeP + resultLineWidth * curStrokeP;
}

function beginStroke(point) {
    isMouseDown = true;
    lastLoc = windowToCanvas(point.x, point.y);
    lastTimeStamp = new Date().getTime();
}

function endStroke() {
    isMouseDown = false;
}

function moveStroke(point) {
    var curLoc = windowToCanvas(point.x, point.y);
    var s = calcDistance(curLoc, lastLoc);
    var curTimeStamp = new Date().getTime();
    var t = curTimeStamp - lastTimeStamp;

    var lineWidth = calcLineWidth(t, s);
    context.save();
    context.beginPath();
    context.moveTo(lastLoc.x, lastLoc.y);
    context.lineTo(curLoc.x, curLoc.y);
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    context.restore();
    // draw
    lastLoc = curLoc;
    lastTimeStamp = curTimeStamp;
    lastLineWidth = lineWidth;

}
canvas.onmousedown = function(e) {
    e.preventDefault();
    beginStroke({ x: e.clientX, y: e.clientY });
}
canvas.onmouseup = function(e) {
    e.preventDefault();
    endStroke();
}
canvas.onmouseout = function(e) {
    e.preventDefault();
    endStroke();
}
canvas.onmousemove = function(e) {
    e.preventDefault();
    if (isMouseDown) moveStroke({ x: e.clientX, y: e.clientY })
}

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0]; //默认用户使用第一个手指进行操作
    //和pc事件不同移动端使用pageX和pageY
    beginStroke({ x: touch.pageX, y: touch.pageY });
})
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touch = e.touches[0]; //默认用户使用第一个手指进行操作
    //和pc事件不同移动端使用pageX和pageY
    if (isMouseDown) moveStroke({ x: touch.pageX, y: touch.pageY })
})
canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    endStroke();
})
$('#clear_btn').click(function(e) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid();
})
$('.color_btn').click(function(e) {
    $('.color_btn').removeClass('color_btn_selected');
    $(this).addClass('color_btn_selected');
    strokeColor = $(this).css('background-color');
})
$('#size_input').keydown(function(e) {

    if (e.keyCode == 13) {
        $('#size_input').blur();
        maxLineWidth = Number($('#size_input').val()) || 30;
        $('#size_input').val(maxLineWidth)
    }

})
drawGrid();