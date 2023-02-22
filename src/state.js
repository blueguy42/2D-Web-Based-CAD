const canvas = document.getElementById('glcanvas');
const canvasLabel = document.getElementById('canvas-label');
const colorWheel = document.getElementById('color-wheel');
const colorLabel = document.getElementById('color-label');
const btn_line = document.getElementById('btn-line');
const btn_square = document.getElementById('btn-square');
const btn_rectangle = document.getElementById('btn-rectangle');
const btn_polygon = document.getElementById('btn-polygon');

var chosenColor = getRandomColor();

var models = [];
var tempModel = [];
var crosshair = [];

var modeLine = 0;
var modeSquare = 0;
var modeRectangle = 0;
var modePolygon = 0;

colorWheel.value = chosenColor;
colorLabel.innerText = chosenColor

colorWheel.addEventListener('change', function(e) {
    chosenColor = e.target.value;
    colorLabel.innerText = e.target.value;
    console.log(`Color wheel: ${chosenColor}`);
})

canvas.addEventListener('mousemove', function(e) {
    let coordinate = getCanvasCoordinate(e);
    canvasLabel.innerText = "";
    if (modeLine != 0 || modeSquare != 0 || modeRectangle != 0 || modePolygon != 0) {
        canvas.style.cursor = "crosshair";
        if (modeLine != 0) {
            canvasLabel.innerText += "Drawing line";
        } else if (modeSquare != 0) {
            canvasLabel.innerText += "Drawing square";
        } else if (modeRectangle != 0) {
            canvasLabel.innerText += "Drawing rectangle";
        } else if (modePolygon != 0) {
            canvasLabel.innerText += "Drawing polygon";
        }
        canvasLabel.innerText += "\n";

        crosshair = [];
        let crosshairX = new Line(crosshair.length);
        crosshairX.setLine(new Coordinate([0, coordinate[1]]), new Color("#d1d1d1"), new Coordinate([canvas.clientWidth, coordinate[1]]), new Color("#777777"));
        let crosshairY = new Line(crosshair.length);
        crosshairY.setLine(new Coordinate([coordinate[0], 0]), new Color("#d1d1d1"), new Coordinate([coordinate[0], canvas.clientHeight]), new Color("#777777"));
        crosshair.push(crosshairX);
        crosshair.push(crosshairY);
    } else {
        canvas.style.cursor = "default";
    }
    if (modeLine == 2) {
        tempModel[0].setLine(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modeSquare == 2) {
        tempModel[0].setSquare(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modeRectangle == 2) {
        tempModel[0].setRectangle(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modePolygon == 2) {
        tempModel[0].setLastCorner(new Coordinate(coordinate), new Color(chosenColor));
    }
    canvasLabel.innerText += "x: " + getCanvastoWebGL_X(canvas, coordinate[0]).toFixed(4) + "\ny: " + getCanvastoWebGL_Y(canvas, coordinate[1]).toFixed(4);
})

canvas.addEventListener('click', function(e) {
    let coordinate = getCanvasCoordinate(e);
    // drawing mode for line, square, rectangle, and polygon
    if (modeLine == 1) {
        tempModel.push(new Line(models.length));
        tempModel[0].setLine(new Coordinate(coordinate), new Color(chosenColor), new Coordinate(coordinate), new Color(chosenColor));
        modeLine = 2;
    } else if (modeLine == 2) {
        tempModel[0].setLine(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
        models.push(tempModel[0]);
        tempModel.pop();
        modeLine = 1;
    } else if (modeSquare == 1) {
        tempModel.push(new Square(models.length));
        tempModel[0].setSquare(new Coordinate(coordinate), new Color(chosenColor), new Coordinate(coordinate), new Color(chosenColor));
        modeSquare = 2;
    } else if (modeSquare == 2) {
        tempModel[0].setSquare(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
        models.push(tempModel[0]);
        tempModel.pop();
        modeSquare = 1;
    } else if (modeRectangle == 1) {
        tempModel.push(new Rectangle(models.length));
        tempModel[0].setRectangle(new Coordinate(coordinate), new Color(chosenColor), new Coordinate(coordinate), new Color(chosenColor));
        modeRectangle = 2;
    } else if (modeRectangle == 2) {
        tempModel[0].setRectangle(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
        models.push(tempModel[0]);
        tempModel.pop();
        modeRectangle = 1;
    } else if (modePolygon == 1) {
        tempModel.push(new Polygon(models.length));
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        modePolygon = 2;
    } else if (modePolygon == 2) {
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
    }
})

canvas.addEventListener('dblclick', function(e) {
    let coordinate = getCanvasCoordinate(e);
    if (modePolygon == 2) {
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        models.push(tempModel[0]);
        tempModel.pop();
        modePolygon = 1;
    }
})

canvas.addEventListener('mouseleave', function(e) {
    if (modeLine != 0) {
        canvasLabel.innerText = "Drawing line";
    } else if (modeSquare != 0) {
        canvasLabel.innerText = "Drawing square";
    } else if (modeRectangle != 0) {
        canvasLabel.innerText = "Drawing rectangle";
    } else if (modePolygon != 0) {
        canvasLabel.innerText = "Drawing polygon";
    } else {
        canvasLabel.innerText = "";
    }
    crosshair = [];
})

btn_line.addEventListener('click', function(e) {lineMode()})
btn_square.addEventListener('click', function(e) {squareMode()})
btn_rectangle.addEventListener('click', function(e) {rectangleMode()})
btn_polygon.addEventListener('click', function(e) {polygonMode()})

document.addEventListener('keyup', function(e) {
    if (e.key == "q") {
        lineMode();
    } else if (e.key == "w") {
        squareMode();
    } else if (e.key == "e") {
        rectangleMode();
    } else if (e.key == "r") {
        polygonMode();
    }
})