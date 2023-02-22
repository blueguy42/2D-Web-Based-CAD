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

getWebGLtoCanvas_X = (canvas, x) => {
    return (x + 1) * canvas.clientWidth / 2;
}

getWebGLtoCanvas_Y = (canvas, y) => {
    return (1 - y) * canvas.clientHeight / 2;
}

getCenter = (vertices) => {
    let x = 0;
    let y = 0;
    vertices.forEach(vertex => {
        x += vertex.coordinate.x;
        y += vertex.coordinate.y;
    });
    return [x / vertices.length, y / vertices.length];
}

sortAntiClockwise = (vertices) => {
    let center = getCenter(vertices);
    vertices.sort((vertex1, vertex2) => {
        let angle1 = Math.atan2(vertex1.coordinate.y - center[1], vertex1.coordinate.x - center[0]);
        let angle2 = Math.atan2(vertex2.coordinate.y - center[1], vertex2.coordinate.x - center[0]);
        return angle1 - angle2;
    });
    return vertices;
}

euclideanDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Monotone chain
cross = (point1, point2, point3) => (point1.coordinate.x - point3.coordinate.x) * (point2.coordinate.y - point3.coordinate.y) - (point1.coordinate.y - point3.coordinate.y) * (point2.coordinate.x - point3.coordinate.x);

convexHull = (vertices) => {
    let points = vertices.slice();
    points.forEach(point => {
        point.coordinate.x = getCanvastoWebGL_X(canvas, point.coordinate.x);
        point.coordinate.y = getCanvastoWebGL_Y(canvas, point.coordinate.y);
    });

    points.sort((point1, point2) => point1.coordinate.x == point2.coordinate.x ? point1.coordinate.y - point2.coordinate.y : point1.coordinate.x - point2.coordinate.x);

    let lowerHull = [];
    for (let i = 0; i < points.length; i++) {
        while (lowerHull.length >= 2 && cross(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], points[i]) <= 0) {
            lowerHull.pop();
        }
        lowerHull.push(points[i]);
    }

    let upperHull = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upperHull.length >= 2 && cross(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], points[i]) <= 0) {
            upperHull.pop();
        }
        upperHull.push(points[i]);
    }

    upperHull.pop();
    lowerHull.pop();

    let result = lowerHull.concat(upperHull);
    result.forEach(point => {
        point.coordinate.x = getWebGLtoCanvas_X(canvas, point.coordinate.x);
        point.coordinate.y = getWebGLtoCanvas_Y(canvas, point.coordinate.y);
    });
    return result;
}          

getGuidesofArr = (arr) => {
    let all = [];
    if (arr.length) {
        arr.map(model => model.guides).map(guide => all = all.concat(guide));
    }
    return all;
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
        btn_convex.style.visibility = 'hidden';
        canvasLabel.innerText = "Drawing line";
        tempModel = [];
        modeLine = 1;
        console.log(`Drawing line`);
    } else if (modeLine == 1 || modeLine == 2) {
        btn_line.classList.remove("button-shape-selected");
        canvasLabel.innerText = "";
        tempModel = [];
        crosshair = [];
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
        btn_convex.style.visibility = 'hidden';
        canvasLabel.innerText = "Drawing square";
        tempModel = [];
        modeSquare = 1;
        console.log(`Drawing square`);
    } else if (modeSquare == 1 || modeSquare == 2) {
        btn_square.classList.remove("button-shape-selected");
        canvasLabel.innerText = "";
        tempModel = [];
        crosshair = [];
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
        btn_convex.style.visibility = 'hidden';
        canvasLabel.innerText = "Drawing rectangle";
        tempModel = [];
        modeRectangle = 1;
        console.log(`Drawing rectangle`);
    } else if (modeRectangle == 1 || modeRectangle == 2) {
        btn_rectangle.classList.remove("button-shape-selected");
        canvasLabel.innerText = "";
        tempModel = [];
        crosshair = [];
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
        btn_convex.style.visibility='visible'
        canvasLabel.innerText = "Drawing polygon";
        if (modeConvex == 1) {
            canvasLabel.innerText += "\nConvex mode";
        } else {
            canvasLabel.innerText += "\nNon-convex mode";
        }
        tempModel = [];
        modePolygon = 1;
        console.log(`Drawing polygon`);
    } else {
        btn_polygon.classList.remove("button-shape-selected");
        btn_convex.style.visibility = 'hidden'
        canvasLabel.innerText = "";
        tempModel = [];
        crosshair = [];
        modePolygon = 0;
    }
}

coordinateMode = () => {
    if (modeCoordinate == 0) {
        btn_coor.classList.remove("btn-coor-webgl");
        btn_coor.classList.add("btn-coor-canvas");
        btn_coor.innerText = "Canvas Coordinate"
        canvasLabel.innerText = "Switched display to canvas coordinate";
        modeCoordinate = 1;
        console.log(`Switched display to canvas coordinate`);
    } else {
        btn_coor.classList.remove("btn-coor-canvas");
        btn_coor.classList.add("btn-coor-webgl");
        btn_coor.innerText = "WebGL Coordinate"
        canvasLabel.innerText = "Switched display to WebGL coordinate";
        modeCoordinate = 0;
        console.log(`Switched display to WebGL coordinate`);
    }
}

convexMode = () => {
    if (modePolygon != 0) {
        if (modeConvex == 0) {
            btn_convex.classList.add("button-shape-selected");
            canvasLabel.innerText = "Switched to convex polygon drawing";
            tempModel = [];
            modeConvex = 1;
            modePolygon = 1;
            console.log(`Convex Hull`);
        } else {
            btn_convex.classList.remove("button-shape-selected");
            canvasLabel.innerText = "Switched to non-convex polygon drawing";
            tempModel = [];
            crosshair = [];
            modeConvex = 0;
            modePolygon = 1;
        }
    }
}
