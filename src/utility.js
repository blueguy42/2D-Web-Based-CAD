getCoordinate = (canvas, event) => {
    return [((event.offsetX / canvas.clientWidth) * 2 - 1), ((1 - (event.offsetY / canvas.clientHeight)) * 2 - 1)];
}

getCanvasCoordinate = (event) => {
    return [event.offsetX, event.offsetY];
}

getCanvastoWebGL_X = (canvas, x) => {
    return (x / canvas.clientWidth) * 2 - 1;
}

getCanvastoWebGL_Y = (canvas, y) => {
    return (1 - (y / canvas.clientHeight)) * 2 - 1;
}

euclideanDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

getRandomColor = () => {
    let letters = '0123456789abcdef';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
  

lineMode = () => {
    if (modeLine == 0 || modeSquare != 0 || modeRectangle != 0 || modePolygon != 0) {
        modeSquare = 0; modeRectangle = 0; modePolygon = 0;
        btn_line.classList.add("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        tempModel = [];
        modeLine = 1;
        console.log(`Drawing line`);
    } else if (modeLine == 1 || modeLine == 2) {
        btn_line.classList.remove("button-shape-selected");
        tempModel = [];
        modeLine = 0;
    }
}

squareMode = () => {
    if (modeSquare == 0 || modeLine != 0 || modeRectangle != 0 || modePolygon != 0) {
        modeLine = 0; modeRectangle = 0; modePolygon = 0;
        btn_square.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        tempModel = [];
        modeSquare = 1;
        console.log(`Drawing square`);
    } else if (modeSquare == 1 || modeSquare == 2) {
        btn_square.classList.remove("button-shape-selected");
        tempModel = [];
        modeSquare = 0;
    }
}

rectangleMode = () => {
    if (modeRectangle == 0 || modeLine != 0 || modeSquare != 0 || modePolygon != 0) {
        modeLine = 0; modeSquare = 0; modePolygon = 0;
        btn_rectangle.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        tempModel = [];
        modeRectangle = 1;
        console.log(`Drawing rectangle`);
    } else if (modeRectangle == 1 || modeRectangle == 2) {
        btn_rectangle.classList.remove("button-shape-selected");
        tempModel = [];
        modeRectangle = 0;
    }
}

polygonMode = () => {
    if (modePolygon == 0 || modeLine != 0 || modeSquare != 0 || modeRectangle != 0) {
        modeLine = 0; modeSquare = 0; modeRectangle = 0;
        btn_polygon.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        tempModel = [];
        modePolygon = 1;
        console.log(`Drawing polygon`);
    } else {
        btn_polygon.classList.remove("button-shape-selected");
        tempModel = [];
        modePolygon = 0;
    }
}

getGuidesofArr = (arr) => {
    let all = [];
    if (arr.length) {
        arr.map(model => model.guides).map(guide => all = all.concat(guide));
    }
    return all;
}