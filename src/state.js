const canvas = document.getElementById('glcanvas');
const canvasLabel = document.getElementById('canvas-label');
const colorWheel = document.getElementById('color-wheel');
const colorLabel = document.getElementById('color-label');
const btn_line = document.getElementById('btn-line');
const btn_square = document.getElementById('btn-square');
const btn_rectangle = document.getElementById('btn-rectangle');
const btn_polygon = document.getElementById('btn-polygon');
const btn_coor = document.getElementById('btn-coor');
const btn_convex = document.getElementById('btn-convex');
const btn_save = document.getElementById('btn-save');
const btn_load = document.getElementById('btn-load');
const btn_clear = document.getElementById('btn-clear');
const btn_randomcolor = document.getElementById('btn-random-color');
const btn_movecorner = document.getElementById('btn-move-corner');
const btn_select = document.getElementById('btn-select');
const property_sidebar = document.getElementById('property');
const transformation_sidebar = document.getElementById('transformation');
const x_slider = document.getElementById('x-slider');
const y_slider = document.getElementById('y-slider');
const rotation_slider = document.getElementById('rotation-slider');
const polygon_special = document.getElementById('polygon-special');
const btn_addPoly = document.getElementById('btn-add-poly');
const btn_removePoly = document.getElementById('btn-remove-poly');

var chosenColor = getRandomColor();

var models = [];
var tempModel = [];
var crosshair = [];

var modeLine = 0;
var modeSquare = 0;
var modeRectangle = 0;
var modePolygon = 0;
var modeCoordinate = 0;
var modeConvex = 0;
var modeMoveCorner = 0;
var modeSelect = 0;
var modeAddPoly = 0;
var modeRemovePoly = 0;

var moveCorners = [];
var moveMousePos = [];
var moveIsEdgeExist = false;

var selectedModel = null;

var lastSelectedModelId = null;
var lastSelectedVerticeId = null;

colorWheel.value = chosenColor;
colorWheel.style.backgroundColor = chosenColor;
colorLabel.innerText = chosenColor;

colorWheel.addEventListener('change', function(e) {
    chosenColor = e.target.value;
    colorLabel.innerText = e.target.value;
    console.log(`Color wheel: ${chosenColor}`);
    if (lastSelectedModelId != null & modeMoveCorner != 0){
        resetCanvasLabel()
        models[lastSelectedModelId].vertices[lastSelectedVerticeId].setColor(new Color(chosenColor));
    } else if (modeSelect != 0 & selectedModel != null){
        resetCanvasLabel()
        selectedModel.setColor(new Color(chosenColor));
    }
})

canvas.addEventListener('mousedown', function(e) {
    let coordinate = getCanvasCoordinate(e);
    if (modeMoveCorner == 1 && moveIsEdgeExist) {
        moveCorners = getNearCornersId(models, coordinate);
        moveMousePos = coordinate;
        modeMoveCorner = 2;
        return;
    }
})

canvas.addEventListener('mouseup', function(e) {
    if (modeMoveCorner == 2) {
        modeMoveCorner = 1;
        moveCorners = [];
        moveMousePos = [];
        moveIsEdgeExist = false;
    }
})

canvas.addEventListener('mousemove', function(e) {
    crosshair = [];
    let coordinate = getCanvasCoordinate(e);
    canvas.style.cursor = "default";
    canvasLabel.innerText = "";
    if (modeLine != 0 || modeSquare != 0 || modeRectangle != 0 || modePolygon != 0 || modeMoveCorner != 0 || modeSelect != 0) {
        if (modeLine != 0 || modeSquare != 0 || modeRectangle != 0 || modePolygon != 0 || modeMoveCorner == 2 || modeAddPoly != 0) {
            canvas.style.cursor = "crosshair";
            let crosshairX = new Line(crosshair.length);
            crosshairX.setLine(new Coordinate([0, coordinate[1]]), new Color("#777777"), new Coordinate([canvas.clientWidth, coordinate[1]]), new Color("#777777"));
            let crosshairY = new Line(crosshair.length);
            crosshairY.setLine(new Coordinate([coordinate[0], 0]), new Color("#777777"), new Coordinate([coordinate[0], canvas.clientHeight]), new Color("#777777"));
            crosshair.push(crosshairX);
            crosshair.push(crosshairY);
        }
        if (modeLine != 0) {
            canvasLabel.innerText += "Drawing line";
            if (modeLine == 1) {
                canvasLabel.innerText += `\nCLICK to start drawing`;
            } else if (modeLine == 2) {
                canvasLabel.innerText += `\nCLICK to finish drawing`;
            }
        } else if (modeSquare != 0) {
            canvasLabel.innerText += "Drawing square";
            if (modeSquare == 1) {
                canvasLabel.innerText += `\nCLICK to start drawing`;
            } else if (modeSquare == 2) {
                canvasLabel.innerText += `\nCLICK to finish drawing`;
            }
        } else if (modeRectangle != 0) {
            canvasLabel.innerText += "Drawing rectangle";
            if (modeRectangle == 1) {
                canvasLabel.innerText += `\nCLICK to start drawing`;
            } else if (modeRectangle == 2) {
                canvasLabel.innerText += `\nCLICK to finish drawing`;
            }
        } else if (modePolygon != 0) {
            canvasLabel.innerText += "Drawing polygon";
            if (modeConvex == 1) {
                canvasLabel.innerText += "\nConvex mode";
            } else {
                canvasLabel.innerText += "\nNon-convex mode";
            }
            if (modePolygon == 1) {
                canvasLabel.innerText += "\nCLICK to start drawing";
            } else if (modePolygon == 2) {
            canvasLabel.innerText += "\n CLICK to draw another corner";
                canvasLabel.innerText += "\nDOUBLE CLICK to finish";
            }
        } else if (modeMoveCorner != 0) {
            canvasLabel.innerText += "Moving corner";
        } else if(modeSelect != 0) {
            if(modeAddPoly==0 && modeRemovePoly==0) {
                canvasLabel.innerText += "Selecting model";
            } else {
                if(modeAddPoly != 0) {
                    canvasLabel.innerText += "Adding vertices to polygon";
                } else if(modeRemovePoly != 0) {
                    canvasLabel.innerText += "Removing vertices from polygon";
                }
                if(selectedModel.convex) {
                    canvasLabel.innerText += "\nConvex mode";
                } else {
                    canvasLabel.innerText += "\nNon-convex mode";
                }
            } 
        }
        canvasLabel.innerText += `\n`;
    }
    if (modeLine == 2) {
        tempModel[0].setLine(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modeSquare == 2) {
        tempModel[0].setSquare(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modeRectangle == 2) {
        tempModel[0].setRectangle(tempModel[0].vertices[0].coordinate, tempModel[0].vertices[0].color, new Coordinate(coordinate), new Color(chosenColor));
    } else if (modePolygon == 2) {
        tempModel[0].setLastCorner(new Coordinate(coordinate), new Color(chosenColor));
    } else if (modeMoveCorner != 0) {
        let corners = getNearCornersId(models, coordinate);
        if (modeMoveCorner == 1) {
            if (corners.length > 0) {
                canvasLabel.innerText += `HoveredModelId: ${corners[0][0]}\nHoveredVertexId: ${corners[0][1]}\n`;
                canvas.style.cursor = "all-scroll";
                moveIsEdgeExist = true;
            } else {
                moveIsEdgeExist = false;
                moveCorners = [];
                moveMousePos = [];
            }
        } else if (modeMoveCorner == 2) {
            if (models[moveCorners[0][0]].type == "square" | models[moveCorners[0][0]].type == "rectangle"){
                models[moveCorners[0][0]].adjustCorner(
                    moveCorners[0][1], 
                    [
                        coordinate[0] - moveMousePos[0] + moveCorners[0][2],
                        coordinate[1] - moveMousePos[1] + moveCorners[0][3],
                    ])
                    // setNearCornersCoordinate = (modelArr, [startX, startY], [endX, endY], nearcorners) => {
                        //     // sets corner vertex and guide from getNearCorners to new coordinate in relation to mouse position
                    //     let corner0 = nearcorners[0];
                    //     let model = modelArr[corner0[0]];
                    //     let vertex = model.vertices[corner0[1]];
                    //     vertex.coordinate.x = endX - startX + corner0[2];
                    //     vertex.coordinate.y = endY - startY + corner0[3];
                    //     let newGuide = new Guide(corner0[1]);
                    //     newGuide.setGuide(new Coordinate([vertex.coordinate.x, vertex.coordinate.y]));
                    //     model.guides[corner0[1]] = newGuide;
                    //     model.setupCenterForModel();
                    // }
            } else {
                setNearCornersCoordinate(models, moveMousePos, coordinate, moveCorners);
            }
            canvasLabel.innerText += `SelectedModelId: ${moveCorners[0][0]}\nSelectedVertexId: ${moveCorners[0][1]}\n`;
        }
    } else if(modeSelect != 0) {
        if(modeAddPoly==0 && modeRemovePoly==0) {
            let hovered = getNearPoint(coordinate);
            if(hovered[0] && hovered[1] == -1) { //center
                canvas.style.cursor = "pointer";
                canvasLabel.innerText += "\nHoveredId: " + hovered[0].id + "\n";
            } else {
                canvasLabel.innerText += "\n";
            }
            if(selectedModel) {
                canvasLabel.innerText += "SelectedModel: " + selectedModel.type;
                canvasLabel.innerText += "\nSelectedId: " + selectedModel.id + "\n";
            }
        } else {
            canvasLabel.innerText += "\nSelectedModel: " + selectedModel.type;
            canvasLabel.innerText += "\nSelectedId: " + selectedModel.id + "\n";
            if(modeAddPoly != 0) {
                selectedModel.setLastCorner(new Coordinate(coordinate), new Color(chosenColor));
            } else if(modeRemovePoly != 0) {
                let hovered = getNearPointInSelected(coordinate);
                if(hovered != -1) {
                    canvas.style.cursor = "pointer";
                    canvasLabel.innerText += "HoveredVertexId: " + hovered + "\n";
                }
            }
        }
    }
    
    // coordinate modes
    if (modeCoordinate == 0) {
        canvasLabel.innerText += "x: " + getCanvastoWebGL_X(canvas, coordinate[0]).toFixed(5) + "\ny: " + getCanvastoWebGL_Y(canvas, coordinate[1]).toFixed(5);
    } else {
        canvasLabel.innerText += "x: " + coordinate[0].toFixed(0) + "\ny: " + coordinate[1].toFixed(0);
    }

    // selected shape
    if (lastSelectedModelId != null) {
        canvasLabel.innerText += "\n\nSelectedModelId: " + lastSelectedModelId + "\nSelectedVertexId: " + lastSelectedVerticeId;   
    }
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
        tempModel.push(new Polygon(models.length, modeConvex));
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        modePolygon = 2;
    } else if (modePolygon == 2) {
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
    } else if(modeSelect != 0) {
        if(modeAddPoly==0 && modeRemovePoly==0) {
            let hovered = getNearPoint(coordinate);
            if(hovered[0] && hovered[1] == -1) { //center
                selectedModel = hovered[0];
                handleShapeSelected(selectedModel);
                setupTransformation();
                canvasLabel.innerText += "\nSelectedId: " + selectedModel.id + "\n";
            }
        } else{
            if(modeAddPoly != 0) {
                selectedModel.addCorner(new Coordinate(coordinate), new Color(chosenColor));
            } else if(modeRemovePoly !=0) {
                let hovered = getNearPointInSelected(coordinate);
                if(hovered != -1) {
                    if(selectedModel.vertices.length > 1) {
                        selectedModel.removeCorner(hovered);
                    } else {
                        console.log("cannot remove all vertices");
                    }
                }
            }
        }
    } else if (modeMoveCorner != 0){
        let corners = getNearCornersId(models, coordinate);
        if (corners.length > 0) {
            lastSelectedModelId = corners[0][0]; lastSelectedVerticeId = corners[0][1];
            resetCanvasLabel();
        }
    }
})

canvas.addEventListener('dblclick', function(e) {
    let coordinate = getCanvasCoordinate(e);
    if (modePolygon == 2) {
        tempModel[0].addCorner(new Coordinate(coordinate), new Color(chosenColor));
        tempModel[0].makePolygon();
        models.push(tempModel[0]);
        tempModel.pop();
        modePolygon = 1;
    }
})

canvas.addEventListener('mouseleave', function(e) {
    resetCanvasLabel();
})

btn_line.addEventListener('click', function(e) {lineMode()})
btn_square.addEventListener('click', function(e) {squareMode()})
btn_rectangle.addEventListener('click', function(e) {rectangleMode()})
btn_polygon.addEventListener('click', function(e) {polygonMode()})
btn_coor.addEventListener('click', function(e) {coordinateMode()})
btn_convex.addEventListener('click', function(e) {convexMode()})
btn_save.addEventListener('click', function(e) {saveModel()})
btn_load.addEventListener('click', function(e) {loadModel()})
btn_clear.addEventListener('click', function(e) {clearModel()})
btn_randomcolor.addEventListener('click', function(e) {randomColor()})
btn_movecorner.addEventListener('click', function(e) {moveCorner()})
btn_select.addEventListener('click', function(e) {selectMode()})
x_slider.addEventListener('input', function(e) {translateSelectedX(x_slider.value)})
y_slider.addEventListener('input', function(e) {translateSelectedY(y_slider.value)})
rotation_slider.addEventListener('input', function(e) {rotateSelected(rotation_slider.value)})
btn_addPoly.addEventListener('click', function(e) {addPoly()})
btn_removePoly.addEventListener('click', function(e) {removePoly()})

btn_line.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Draw line";
})

btn_square.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Draw square";
})

btn_rectangle.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Draw rectangle";
})

btn_polygon.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Draw polygon";
    if (modeConvex == 1) {
        canvasLabel.innerText += "\nConvex mode";
    } else {
        canvasLabel.innerText += "\nNon-convex mode";
    }
})

btn_coor.addEventListener('mouseover', function(e) {
    if (modeCoordinate == 0) {
        canvasLabel.innerText = "Switch display to canvas coordinate";
    } else {
        canvasLabel.innerText = "Switch display to WebGL coordinate";
    }
})

btn_convex.addEventListener('mouseover', function(e) {
    if (modeConvex == 0) {
        canvasLabel.innerText = "Switch to convex polygon drawing";
    } else {
        canvasLabel.innerText = "Switch to non-convex polygon drawing";
    }
})

btn_save.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Save model";
})

btn_load.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Load model";
})

btn_clear.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Clear canvas";
})

btn_randomcolor.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Randomize color";
})

btn_movecorner.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Move corner";
})

btn_select.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Selecting model";
})

btn_addPoly.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Adding vertices to polygon";
})

btn_removePoly.addEventListener('mouseover', function(e) {
    canvasLabel.innerText = "Removing vertices from polygon";
})

btn_line.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_square.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_rectangle.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_polygon.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_coor.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_convex.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_save.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_load.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_clear.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_randomcolor.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_movecorner.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_select.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_addPoly.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

btn_removePoly.addEventListener('mouseleave', function(e) {
    canvasLabel.innerText = "";
})

document.addEventListener('keyup', function(e) {
    let key = e.key.toLowerCase();
    if (key == "a") {
        lineMode();
    } else if (key == "s") {
        squareMode();
    } else if (key == "d") {
        rectangleMode();
    } else if (key == "f") {
        polygonMode();
    } else if (key == "q") {
        coordinateMode();
    } else if (key == "g") {
        convexMode();
    } else if (key == "e") {
        saveModel();
    } else if (key == "r") {
        loadModel();
    } else if (key == "t") {
        clearModel();
    } else if (key == "w") {
        randomColor();
    } else if (key == "z") {
        moveCorner();
    } else if (key == "x") {
        selectMode();
    }
})