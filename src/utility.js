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

getCenterPoint = (vertices) => {
    let x = 0;
    let y = 0;
    vertices.forEach(vertex => {
        x += vertex.coordinate.x;
        y += vertex.coordinate.y;
    });
    let centerColor = new Color();
    centerColor.r = vertices[0].color.r;
    centerColor.g = vertices[0].color.g;
    centerColor.b = vertices[0].color.b;
    return new Point(new Coordinate([x / vertices.length, y / vertices.length]), centerColor);
}

sortAntiClockwise = (vertices) => {
    let center = getCenter(vertices);
    vertices.sort((vertex1, vertex2) => {
        let angle1 = Math.atan2(vertex1.coordinate.y - center[1], vertex1.coordinate.x - center[0]);
        let angle2 = Math.atan2(vertex2.coordinate.y - center[1], vertex2.coordinate.x - center[0]);
        return angle1 - angle2;
    });
    // return vertices;
}

euclideanDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

differenceXY = (x1, y1, x2, y2) => {
    return [x2 - x1, y2 - y1];
}

getModelId = (modelArr, modelId) => {
    for (let i = 0; i < modelArr.length; i++) {
        if (modelArr[i].id == modelId) {
            return i;
        }
    }
    return -1;
}

getVertexId = (model, vertexId) => {
    for (let i = 0; i < model.vertices.length; i++) {
        if (model.vertices[i].id == vertexId) {
            return i;
        }
    }
    return -1;
}

getNearPoint = ([x,y]) => {
    let result = [null,-1];
    for(let i = models.length-1;i>=0;i--) {
        if(euclideanDistance(x,y, models[i].center.coordinate.x, models[i].center.coordinate.y) <= 6) {
            result = [models[i], -1];
            break;
        }
        for(let j = models[i].vertices.length-1;j>=0;j--) {
            if(euclideanDistance(x,y, models[i].vertices[j].coordinate.x, models[i].vertices[j].coordinate.y) <= 6) {
                result = [models[i], j];
                break;
            }
        }
    }
    return result;
}

getNearCornersId = (modelArr, [x, y], type="all") => {
    // returns [model id, vertex id, x, y]
    let result = [];
    let modelIndex = -1;
    let vertexIndex = -1;
    modelArr.forEach(model => {
        modelIndex++;
        vertexIndex = -1;
        if (model.type == type || type == "all") {
            model.vertices.forEach(vertex => {
                vertexIndex++;
                if (euclideanDistance(x, y, vertex.coordinate.x, vertex.coordinate.y) <= 6) {
                    if (model.type == "polygon" && model.convex == true && model.vertices.length > 2) {
                        result.push([modelIndex, vertexIndex, vertex.coordinate.x, vertex.coordinate.y, [model.type, model.convex]]);
                    } else {
                        result.push([modelIndex, vertexIndex, vertex.coordinate.x, vertex.coordinate.y, [model.type, 0]]);
                    }
                }
            });
        }
    });
    return result;
}

setNearCornersCoordinate = (modelArr, [startX, startY], [endX, endY], nearcorners) => {
    // sets corner vertex and guide from getNearCorners to new coordinate in relation to mouse position
    let corner0 = nearcorners[0];
    let changeableCorners = nearcorners.filter(corner => corner[0] == corner0[0]);
    for (let i = 0; i < changeableCorners.length; i++) {
        let nearcorner = changeableCorners[i];
        // check if corner is part of a convex polygon and is the second or last vertex. If not convex polygon corner is first vertex of changeable corners
        if ((nearcorner[4][0] == "polygon" && nearcorner[4][1] && [1, modelArr[nearcorner[0]].vertices.length-1].includes(nearcorner[1])) || i == 0) {
            let model = modelArr[nearcorner[0]];
            let vertex = model.vertices[nearcorner[1]];
            vertex.coordinate.x = endX - startX + nearcorner[2];
            vertex.coordinate.y = endY - startY + nearcorner[3];
            let newGuide = new Guide(nearcorner[1]);
            newGuide.setGuide(new Coordinate([vertex.coordinate.x, vertex.coordinate.y]));
            model.guides[nearcorner[1]] = newGuide;
        }
    }
}

setNearCornersColor = (modelArr, nearcorners, newColor) => {
    // sets corner vertex color from getNearCorners
    let nearcorner = nearcorners[0];
    let model = modelArr[nearcorner[0]];
    let vertex = model.vertices[nearcorner[1]];
    vertex.color = newColor;

    let corner0 = nearcorners[0];
    let changeableCorners = nearcorners.filter(corner => corner[0] == corner0[0]);
    for (let i = 0; i < changeableCorners.length; i++) {
        let nearcorner = changeableCorners[i];
        if ((nearcorner[4][0] == "polygon" && nearcorner[4][1] && [1, modelArr[nearcorner[0]].vertices.length].includes(nearcorner[1])) || i == 0) {
            let model = modelArr[nearcorner[0]];
            let vertex = model.vertices[nearcorner[1]];
            vertex.color = newColor;
        }
    }
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
        arr.forEach(model => {
            if(model.center) {
                all.push(model.centerGuide)
            }
        });
    }
    return all;
}

getRandomColor = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
  

lineMode = () => {
    if (modeLine == 0) {
        modeSquare = 0; modeRectangle = 0; modePolygon = 0; modeMoveCorner = 0; modeSelect = 0;
        btn_line.classList.add("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        btn_movecorner.classList.remove("btn-purple");
        btn_select.classList.remove("btn-purple");
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
    if (modeSquare == 0) {
        modeLine = 0; modeRectangle = 0; modePolygon = 0; modeMoveCorner = 0; modeSelect = 0;
        btn_square.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        btn_movecorner.classList.remove("btn-purple");
        btn_select.classList.remove("btn-purple");
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
    if (modeRectangle == 0) {
        modeLine = 0; modeSquare = 0; modePolygon = 0; modeMoveCorner = 0; modeSelect = 0;
        btn_rectangle.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        btn_movecorner.classList.remove("btn-purple");
        btn_select.classList.remove("btn-purple");
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
    if (modePolygon == 0) {
        modeLine = 0; modeSquare = 0; modeRectangle = 0; modeMoveCorner = 0; modeSelect = 0;
        btn_polygon.classList.add("button-shape-selected");
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_movecorner.classList.remove("btn-purple");
        btn_select.classList.remove("btn-purple");
        btn_convex.style.visibility='visible'
        canvasLabel.innerText = "Drawing polygon";
        if (modeConvex == 1) {
            canvasLabel.innerText += "\nConvex mode";
        } else {
            canvasLabel.innerText += "\nNon-convex mode";
        }
        canvasLabel.innerText += "\nDOUBLE CLICK to finish";
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
        btn_coor.classList.remove("btn-purplel");
        btn_coor.classList.add("btn-red");
        btn_coor.innerText = "Canvas Coordinate [Q]"
        canvasLabel.innerText = "Switched display to canvas coordinate";
        modeCoordinate = 1;
        console.log(`Switched display to canvas coordinate`);
    } else {
        btn_coor.classList.remove("btn-red");
        btn_coor.classList.add("btn-purple");
        btn_coor.innerText = "WebGL Coordinate [Q]"
        canvasLabel.innerText = "Switched display to WebGL coordinate";
        modeCoordinate = 0;
        console.log(`Switched display to WebGL coordinate`);
    }
}

convexMode = () => {
    if (modePolygon != 0) {
        if (modeConvex == 0) {
            btn_convex.classList.add("button-shape-sub");
            canvasLabel.innerText = "Switched to convex polygon drawing";
            tempModel = [];
            modeConvex = 1;
            modePolygon = 1;
            console.log(`Convex Hull`);
        } else {
            btn_convex.classList.remove("button-shape-sub");
            canvasLabel.innerText = "Switched to non-convex polygon drawing";
            tempModel = [];
            crosshair = [];
            modeConvex = 0;
            modePolygon = 1;
        }
    }
}

saveFile = (filename, content) => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    anchor.setAttribute('download', filename);
    anchor.click();
}

saveModel = () => {
    console.log(models);
    if (models.length == 0) {
        canvasLabel.innerText = "No model to save";
    } else {
        const savedModels = JSON.parse(JSON.stringify(models));
        savedModels.forEach(model => {
            model.vertices.forEach(vertex => {
                vertex.coordinate.x = getCanvastoWebGL_X(canvas,vertex.coordinate.x);
                vertex.coordinate.y = getCanvastoWebGL_Y(canvas,vertex.coordinate.y);
            })
            model.guides.forEach(guide => {
                guide.vertices.forEach(vertex => {
                    vertex.coordinate.x = getCanvastoWebGL_X(canvas,vertex.coordinate.x);
                    vertex.coordinate.y = getCanvastoWebGL_Y(canvas,vertex.coordinate.y);
                })
            })
        })
        saveFile("models.json", JSON.stringify(savedModels));
        canvasLabel.innerText = "Saved model";
        console.log(savedModels);
    }
}

loadModel = () => {
    let input = document.createElement('input');
    input.type = "file";
    let inputModels = [];
    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            var loadedModels = JSON.parse(content);
            loadedModels.forEach(model => {
                let newModel;
                if(model.type == "line") {
                    newModel = new Line(models.length);
                } else if(model.type == "square") {
                    newModel = new Square(models.length);
                } else if(model.type == "rectangle") {
                    newModel = new Rectangle(models.length);
                } else if(model.type == "polygon") {
                    newModel = new Polygon(models.length,model.convex);
                }
                model.vertices.forEach(vertex => {
                    vertex.coordinate.x = getWebGLtoCanvas_X(canvas,vertex.coordinate.x);
                    vertex.coordinate.y = getWebGLtoCanvas_Y(canvas,vertex.coordinate.y);
                })
                newModel.copy(model);
                console.log(JSON.stringify(newModel));
                inputModels.push(newModel);
            });

            if (inputModels.length != 0) {
                models = models.concat(inputModels);
                canvasLabel.innerText = "Loaded model";
            } else {
                canvasLabel.innerText = "No model to load";
            }
        }
    }
    input.click();
}

clearModel = () => {
    if (models.length == 0) {
        canvasLabel.innerText = "Canvas is already cleared";
    } else {
        canvasLabel.innerText = "Cleared canvas";
    }
    models = [];
    tempModel = [];
    crosshair = [];
    modeLine = 0; modeSquare = 0; modeRectangle = 0; modePolygon = 0;
    btn_line.classList.remove("button-shape-selected");
    btn_square.classList.remove("button-shape-selected");
    btn_rectangle.classList.remove("button-shape-selected");
    btn_polygon.classList.remove("button-shape-selected");
    btn_movecorner.classList.remove("btn-purple");
    btn_convex.style.visibility = 'hidden';
}

randomColor = () => {
    let color = getRandomColor();
    colorWheel.value = color;
    colorWheel.style.backgroundColor = color;
    colorLabel.innerText = color;
    chosenColor = color;
    canvasLabel.innerText = "Random color generated: " + color;
}

moveCorner = () => {
    if (modeMoveCorner == 0) {
        modeLine = 0; modeSquare = 0; modeRectangle = 0; modePolygon = 0; modeSelect = 0;
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        btn_select.classList.remove("button-shape-selected");
        btn_movecorner.classList.add("btn-purple");
        canvasLabel.innerText = "Moving corner";
        btn_convex.style.visibility = 'hidden';
        tempModel = [];
        crosshair = [];
        modeMoveCorner = 1;
        console.log(`Moving corner`);
    } else if (modeMoveCorner == 1) {
        btn_movecorner.classList.remove("btn-purple");
        canvasLabel.innerText = "";
        modeMoveCorner = 0;
    }
}

selectMode = () => {
    if (modeSelect == 0) {
        modeLine = 0; modeSquare = 0; modeRectangle = 0; modePolygon = 0; modeMoveCorner=0;
        btn_line.classList.remove("button-shape-selected");
        btn_square.classList.remove("button-shape-selected");
        btn_rectangle.classList.remove("button-shape-selected");
        btn_polygon.classList.remove("button-shape-selected");
        btn_movecorner.classList.remove("btn-purple");        
        btn_select.classList.add("btn-purple");
        canvasLabel.innerText = "Selecting model";
        tempModel = [];
        modeSelect = 1;
        console.log(`Selecting model`);
    } else if (modeSelect == 1) {
        btn_select.classList.remove("btn-purple");
        canvasLabel.innerText = "";
        modeSelect = 0;
        selectedModel = null;
    }
}