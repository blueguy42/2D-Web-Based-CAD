class Coordinate {
  constructor([x = 0, y = 0] = []) {
    this.x = x;
    this.y = y;
  }
}

class Color {
  constructor(hex = "#000000") {
    this.r = parseInt(hex.substring(1, 3), 16);
    this.g = parseInt(hex.substring(3, 5), 16);
    this.b = parseInt(hex.substring(5, 7), 16);
  }
}

class Point {
  constructor(coordinate = new Coordinate(), color = new Color(), id = -1) {
    this.coordinate = coordinate;
    this.color = color;
    this.id = id;
  }

  setColor = (color) => 
  this.color = color;
}

class Model {
  constructor(id = -1, type="") {
    this.id = id;
    this.vertices = [];
    this.type = type;
    this.center = new Point();
    this.rotation = 0;
  }

  addVertex = (coordinate, color) => {
    this.vertices.push(new Point(coordinate, color, this.vertices.length));
  }

  setColor = (color) => {
    this.vertices.forEach((vertex) => {
      vertex.setColor(color);
    });
    this.center.setColor(color);
  }

  getVertexCount = () => this.vertices.length;

  copy = (other) => {
    this.vertices = [];
    this.guides = [];
    this.rotation = other.rotation;
    other.vertices.forEach((vertex) => {
      this.addVertex(vertex.coordinate, vertex.color);
      let guide = new Guide(this.guides.length);
      guide.setGuide(vertex.coordinate);
      this.guides.push(guide);
    })
    this.setupCenterForModel();
  }

  setupCenterForModel = () => {
    this.center = getCenterPoint(this.vertices);
    this.centerGuide.setCenterGuide(this.center.coordinate);
  }

  translate = (diffX,diffY) => {
    for (let i = 0; i< this.vertices.length; i++) {
      let vertex = this.vertices[i];
      vertex.coordinate.x += diffX;
      vertex.coordinate.y += diffY;
      this.guides[i].setGuide(vertex.coordinate);
    }
    this.setupCenterForModel();
  }

  rotate = (diffRotate) => {
    let diffRotateRadian = diffRotate * Math.PI / 180;
    for(let i = 0; i < this.vertices.length; i++) {
      let vertex = this.vertices[i];
      let x = vertex.coordinate.x - this.center.coordinate.x;
      let y = vertex.coordinate.y - this.center.coordinate.y;
      let newX = x * Math.cos(diffRotateRadian) - y * Math.sin(diffRotateRadian);
      let newY = x * Math.sin(diffRotateRadian) + y * Math.cos(diffRotateRadian);
      vertex.coordinate.x = newX + this.center.coordinate.x;
      vertex.coordinate.y = newY + this.center.coordinate.y;
      this.guides[i].setGuide(vertex.coordinate);
    }
    this.rotation += diffRotate;
  }

  unrotate = (angle) => {
    this.rotate(-angle);
  }
}

class Line extends Model {
  constructor(id = -1) {
    super(id, "line");
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());

    let guide1 = new Guide(0);
    let guide2 = new Guide(1);
    guide1.setGuide(new Coordinate());
    guide2.setGuide(new Coordinate());
    this.guides = [guide1, guide2];
    this.centerGuide = new CenterGuide();
  }
  
  setLine = (coordinate1, color1, coordinate2, color2) => {
    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = coordinate2;
    this.vertices[1].color = color2;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(coordinate2);
    this.setupCenterForModel();
  }

  getLength = () => {
    return euclideanDistance(
      this.vertices[0].coordinate.x, this.vertices[0].coordinate.y,
      this.vertices[1].coordinate.x, this.vertices[1].coordinate.y);
  }

  setLength = (newLength) => {
    let oldLength = this.getLength();
    let midpoint = new Coordinate(
      [
        (this.vertices[0].coordinate.x + this.vertices[1].coordinate.x)/2,
        (this.vertices[0].coordinate.y + this.vertices[1].coordinate.y)/2
      ]
    ) 
    let newX1 = this.vertices[0].coordinate.x - midpoint.x;
    let newY1 = this.vertices[0].coordinate.y - midpoint.y;
    let newX2 = this.vertices[1].coordinate.x - midpoint.x;
    let newY2 = this.vertices[1].coordinate.y - midpoint.y;
    
    let ratio = newLength/oldLength;
    newX1 *= ratio; newY1 *= ratio; newX2 *= ratio; newY2 *= ratio;

    newX1 += midpoint.x; newY1 += midpoint.y;
    newX2 += midpoint.x; newY2 += midpoint.y;

    this.setLine(new Coordinate([newX1, newY1]), this.vertices[0].color, new Coordinate([newX2, newY2]), this.vertices[1].color);
  } 

  render = () => {
    const lineVertices = [];

    this.vertices.forEach((vertex) => {
      lineVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      lineVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      lineVertices.push(vertex.color.r / 255);
      lineVertices.push(vertex.color.g / 255);
      lineVertices.push(vertex.color.b / 255);
    });


    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    gl.drawArrays(gl.LINES, 0, this.getVertexCount());
  }
}

class Rectangle extends Model {
  constructor(id = -1) {
    super(id, "rectangle");
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());

    let guide1 = new Guide(0);
    let guide2 = new Guide(1);
    let guide3 = new Guide(2);
    let guide4 = new Guide(3);
    guide1.setGuide(new Coordinate());
    guide2.setGuide(new Coordinate());
    guide3.setGuide(new Coordinate());
    guide4.setGuide(new Coordinate());
    this.guides = [guide1, guide2, guide3, guide4];
    this.centerGuide = new CenterGuide();
  }
  
  setRectangle = (coordinate1, color1, coordinate2, color2) => {
    let newColor = new Color();
    newColor.r = Math.sqrt((Math.pow(color1.r, 2) + Math.pow(color2.r, 2))/2);
    newColor.g = Math.sqrt((Math.pow(color1.g, 2) + Math.pow(color2.g, 2))/2);
    newColor.b = Math.sqrt((Math.pow(color1.b, 2) + Math.pow(color2.b, 2))/2);

    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = new Coordinate([coordinate2.x, coordinate1.y]);
    this.vertices[1].color = newColor;
    this.vertices[2].coordinate = coordinate2;
    this.vertices[2].color = color2;
    this.vertices[3].coordinate = new Coordinate([coordinate1.x, coordinate2.y]);
    this.vertices[3].color = newColor;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(new Coordinate([coordinate2.x, coordinate1.y]));
    this.guides[2].setGuide(coordinate2);
    this.guides[3].setGuide(new Coordinate([coordinate1.x, coordinate2.y]));
    this.setupCenterForModel();
  }

  setRectangle4Coloured = (coordinate1, color1, coordinate2, color2, color3, color4) => {
    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = new Coordinate([coordinate2.x, coordinate1.y]);
    this.vertices[1].color = color3;
    this.vertices[2].coordinate = coordinate2;
    this.vertices[2].color = color2;
    this.vertices[3].coordinate = new Coordinate([coordinate1.x, coordinate2.y]);
    this.vertices[3].color = color4;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(new Coordinate([coordinate2.x, coordinate1.y]));
    this.guides[2].setGuide(coordinate2);
    this.guides[3].setGuide(new Coordinate([coordinate1.x, coordinate2.y]));
    this.setupCenterForModel();
  }

  getWidth = () => {
    return euclideanDistance(
      this.vertices[0].coordinate.x, this.vertices[0].coordinate.y, 
      this.vertices[1].coordinate.x, this.vertices[1].coordinate.y);
  }

  setWidth = (newWidth) => {
    let tempRotation = this.rotation;
    this.unrotate(tempRotation);
    let oldWidth = this.getWidth();
    let ratio = newWidth / oldWidth;
    let bottom_midpoint = new Coordinate(
      [(this.vertices[0].coordinate.x + this.vertices[1].coordinate.x)/2,
      (this.vertices[0].coordinate.y + this.vertices[1].coordinate.y)/2]);
    let top_midpoint = new Coordinate(
      [(this.vertices[2].coordinate.x + this.vertices[3].coordinate.x)/2,
      (this.vertices[2].coordinate.y + this.vertices[3].coordinate.y)/2]);
    let new_x1 = (this.vertices[0].coordinate.x - bottom_midpoint.x) * ratio + bottom_midpoint.x;
    let new_x2 = (this.vertices[2].coordinate.x - top_midpoint.x) * ratio + top_midpoint.x;
    let new_y1 = (this.vertices[0].coordinate.y - bottom_midpoint.y) * ratio + bottom_midpoint.y;
    let new_y2 = (this.vertices[2].coordinate.y - top_midpoint.y) * ratio + top_midpoint.y;
    this.setRectangle4Coloured(
      new Coordinate([new_x1, new_y1]), this.vertices[0].color, 
      new Coordinate([new_x2, new_y2]), this.vertices[2].color,
      this.vertices[1].color, this.vertices[3].color);
    this.rotate(tempRotation);
  }

  getHeight = () => {
    return euclideanDistance(
      this.vertices[0].coordinate.x, this.vertices[0].coordinate.y,
      this.vertices[3].coordinate.x, this.vertices[3].coordinate.y);
  }

  setHeight = (newHeight) => {
    let tempRotation = this.rotation;
    this.unrotate(tempRotation);
    let oldHeight = this.getHeight();
    let ratio = newHeight / oldHeight;
    let left_midpoint = new Coordinate(
      [(this.vertices[0].coordinate.x + this.vertices[3].coordinate.x)/2,
      (this.vertices[0].coordinate.y + this.vertices[3].coordinate.y)/2]);
    let right_midpoint = new Coordinate(
      [(this.vertices[1].coordinate.x + this.vertices[2].coordinate.x)/2,
      (this.vertices[1].coordinate.y + this.vertices[2].coordinate.y)/2]);
    let new_x1 = (this.vertices[0].coordinate.x - left_midpoint.x) * ratio + left_midpoint.x;
    let new_x2 = (this.vertices[2].coordinate.x - right_midpoint.x) * ratio + right_midpoint.x;
    let new_y1 = (this.vertices[0].coordinate.y - left_midpoint.y) * ratio + left_midpoint.y;
    let new_y2 = (this.vertices[2].coordinate.y - right_midpoint.y) * ratio + right_midpoint.y;
    this.setRectangle4Coloured(
      new Coordinate([new_x1, new_y1]), this.vertices[0].color,
      new Coordinate([new_x2, new_y2]), this.vertices[2].color,
      this.vertices[1].color, this.vertices[3].color);
    this.rotate(tempRotation);
  }

  resetCoords = (coordinate1, coordinate2, coordinate3, coordinate4) => {
    this.vertices[0].coordinate = coordinate1;
    this.vertices[1].coordinate = coordinate2;
    this.vertices[2].coordinate = coordinate3;
    this.vertices[3].coordinate = coordinate4;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(coordinate2);
    this.guides[2].setGuide(coordinate3);
    this.guides[3].setGuide(coordinate4);
    this.setupCenterForModel();
  }

  adjustCorner = (cornerId, [newX, newY]) => {
    let tempRotation = this.rotation;
    this.unrotate(tempRotation);

    let midpoint = new Coordinate(
      [
        (this.vertices[0].coordinate.x + this.vertices[1].coordinate.x + this.vertices[2].coordinate.x + this.vertices[3].coordinate.x)/4,
        (this.vertices[0].coordinate.y + this.vertices[1].coordinate.y + this.vertices[2].coordinate.y + this.vertices[3].coordinate.y)/4
      ]
    );

    let oldDistanceToMiddle = euclideanDistance(
      this.vertices[cornerId].coordinate.x, this.vertices[cornerId].coordinate.y,
      midpoint.x, midpoint.y
    ) 
    let newDistanceToMiddle = euclideanDistance(
      newX, newY,
      midpoint.x, midpoint.y
    )
    let ratio = newDistanceToMiddle / oldDistanceToMiddle;

    let new_x1 = (this.vertices[0].coordinate.x - midpoint.x) * ratio + midpoint.x;
    let new_y1 = (this.vertices[0].coordinate.y - midpoint.y) * ratio + midpoint.y;
    let new_x2 = (this.vertices[1].coordinate.x - midpoint.x) * ratio + midpoint.x;
    let new_y2 = (this.vertices[1].coordinate.y - midpoint.y) * ratio + midpoint.y;
    let new_x3 = (this.vertices[2].coordinate.x - midpoint.x) * ratio + midpoint.x;
    let new_y3 = (this.vertices[2].coordinate.y - midpoint.y) * ratio + midpoint.y;
    let new_y4 = (this.vertices[3].coordinate.y - midpoint.y) * ratio + midpoint.y;
    let new_x4 = (this.vertices[3].coordinate.x - midpoint.x) * ratio + midpoint.x;

    this.resetCoords(
      new Coordinate([new_x1, new_y1]),
      new Coordinate([new_x2, new_y2]),
      new Coordinate([new_x3, new_y3]),
      new Coordinate([new_x4, new_y4])
    )

    this.rotate(tempRotation);
  }
  
  render = () => {
    const rectangleVertices = [];

    this.vertices.forEach((vertex) => {
      rectangleVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      rectangleVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      rectangleVertices.push(vertex.color.r / 255);
      rectangleVertices.push(vertex.color.g / 255);
      rectangleVertices.push(vertex.color.b / 255);
    });

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleVertices), gl.STATIC_DRAW);

    let indices = [0,1,2,2,3,0]; 

    let indexBufer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
  }
}

class Square extends Rectangle {
  constructor(id = -1) {
    super(id);
    this.type = "square";
  }

  // making a square in webgl
  setSquare = (coordinate1, color1, coordinate2, color2) => {
    let newColor = new Color();
    newColor.r = Math.sqrt((Math.pow(color1.r, 2) + Math.pow(color2.r, 2))/2);
    newColor.g = Math.sqrt((Math.pow(color1.g, 2) + Math.pow(color2.g, 2))/2);
    newColor.b = Math.sqrt((Math.pow(color1.b, 2) + Math.pow(color2.b, 2))/2);

    let newCoordinate = new Coordinate();
    let xDiff = (coordinate2.x - coordinate1.x);
    let yDiff = coordinate2.y - coordinate1.y;
    let xSign = 0;
    let ySign = 0;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {xSign = Math.abs(xDiff)} else {xSign = -Math.abs(xDiff)}
      if (yDiff > 0) {ySign = Math.abs(xDiff)} else {ySign = -Math.abs(xDiff)}
      newCoordinate.x = coordinate1.x + xSign;
      newCoordinate.y = coordinate1.y + ySign;
    } else {
      if (xDiff > 0) {xSign = Math.abs(yDiff)} else {xSign = -Math.abs(yDiff)}
      if (yDiff > 0) {ySign = Math.abs(yDiff)} else {ySign = -Math.abs(yDiff)}
      newCoordinate.x = coordinate1.x + xSign;
      newCoordinate.y = coordinate1.y + ySign;
    }

    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = new Coordinate([newCoordinate.x, coordinate1.y]);
    this.vertices[1].color = newColor;
    this.vertices[2].coordinate = newCoordinate;
    this.vertices[2].color = color2;
    this.vertices[3].coordinate = new Coordinate([coordinate1.x, newCoordinate.y]);
    this.vertices[3].color = newColor;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(new Coordinate([newCoordinate.x, coordinate1.y]));
    this.guides[2].setGuide(newCoordinate);
    this.guides[3].setGuide(new Coordinate([coordinate1.x, newCoordinate.y]));
    this.setupCenterForModel();
  }

  setSquare4Coloured = (coordinate1, color1, coordinate2, color2, coordinate3, color3, coordinate4, color4) => {
    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = coordinate2;
    this.vertices[1].color = color2;
    this.vertices[2].coordinate = coordinate3;
    this.vertices[2].color = color3;
    this.vertices[3].coordinate = coordinate4;
    this.vertices[3].color = color4;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(coordinate2);
    this.guides[2].setGuide(coordinate3);
    this.guides[3].setGuide(coordinate4);
    this.setupCenterForModel();
  }

  getLength = () => {
    return euclideanDistance(
      this.vertices[0].coordinate.x, this.vertices[0].coordinate.y,
      this.vertices[1].coordinate.x, this.vertices[1].coordinate.y
    )
  }
  
  setLength = (newLength) => {
    let oldLength = this.getLength();
    let ratio = newLength/oldLength;

    let center_x = (
      this.vertices[0].coordinate.x + this.vertices[1].coordinate.x 
      + this.vertices[2].coordinate.x + this.vertices[3].coordinate.x)/4;
    let center_y = (
      this.vertices[0].coordinate.y + this.vertices[1].coordinate.y 
      + this.vertices[2].coordinate.y + this.vertices[3].coordinate.y)/4;
    let center = new Coordinate([center_x, center_y]);

    let new_x1 = center.x + ((this.vertices[0].coordinate.x - center.x) * ratio);
    let new_y1 = center.y + ((this.vertices[0].coordinate.y - center.y) * ratio);
    let new_x2 = center.x + ((this.vertices[1].coordinate.x - center.x) * ratio);
    let new_y2 = center.y + ((this.vertices[1].coordinate.y - center.y) * ratio);
    let new_x3 = center.x + ((this.vertices[2].coordinate.x - center.x) * ratio);
    let new_y3 = center.y + ((this.vertices[2].coordinate.y - center.y) * ratio);
    let new_x4 = center.x + ((this.vertices[3].coordinate.x - center.x) * ratio);
    let new_y4 = center.y + ((this.vertices[3].coordinate.y - center.y) * ratio);
    
    this.setSquare4Coloured(
      new Coordinate([new_x1, new_y1]), this.vertices[0].color,
      new Coordinate([new_x2, new_y2]), this.vertices[1].color,
      new Coordinate([new_x3, new_y3]), this.vertices[2].color,
      new Coordinate([new_x4, new_y4]), this.vertices[3].color
    )
  }
}

class Polygon extends Model {
  constructor(id = -1, convex=false) {
    super(id, "polygon");
    this.guides = [];
    this.convex = convex;
    this.centerGuide = new CenterGuide();
  }

  addCorner = (coordinate1, color1) => {
    this.addVertex(coordinate1, color1);
    let guide1 = new Guide(this.vertices.length-1);
    guide1.setGuide(coordinate1);
    this.guides.push(guide1);
    this.setupCenterForModel();
  }

  setLastCorner = (coordinate1, color1) => {
    this.vertices[this.vertices.length-1].coordinate = coordinate1;
    this.vertices[this.vertices.length-1].color = color1;
    this.guides[this.guides.length-1].setGuide(coordinate1);
    this.setupCenterForModel();
  }

  makePolygon = () => {
    this.vertices = this.vertices.slice(0, -3);
    this.guides = this.guides.slice(0, -3);
    this.makeConvexHull();
    this.setupCenterForModel();
  }

  makeConvexHull = () => {
    if (this.convex && this.vertices.length > 2) {
      this.vertices = convexHull(this.vertices);
      sortAntiClockwise(this.vertices);
      this.guides = [];
      this.vertices.forEach((vertex) => {
        let guide1 = new Guide(this.guides.length);
        guide1.setGuide(vertex.coordinate);
        this.guides.push(guide1);
      });
    }
  }

  render = () => {
    const polygonVertices = [];

    if(this.vertices.length > 2) {
      polygonVertices.push(getCanvastoWebGL_X(canvas, this.center.coordinate.x));
      polygonVertices.push(getCanvastoWebGL_Y(canvas, this.center.coordinate.y));
      polygonVertices.push(this.center.color.r / 255);
      polygonVertices.push(this.center.color.g / 255);
      polygonVertices.push(this.center.color.b / 255);
    }
    this.vertices.forEach((vertex) => {
      polygonVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      polygonVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      polygonVertices.push(vertex.color.r / 255);
      polygonVertices.push(vertex.color.g / 255);
      polygonVertices.push(vertex.color.b / 255);
    });
    if (this.vertices.length > 2) {
      polygonVertices.push(getCanvastoWebGL_X(canvas, this.vertices[0].coordinate.x));
      polygonVertices.push(getCanvastoWebGL_Y(canvas, this.vertices[0].coordinate.y));
      polygonVertices.push(this.vertices[0].color.r / 255);
      polygonVertices.push(this.vertices[0].color.g / 255);
      polygonVertices.push(this.vertices[0].color.b / 255);
    }

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygonVertices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    if (this.vertices.length == 1) {
      gl.drawArrays(gl.POINTS, 0, polygonVertices.length/5);
    } else if (this.vertices.length == 2) {
      gl.drawArrays(gl.LINES, 0, polygonVertices.length/5);
    } else {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, polygonVertices.length/5);
    }
  }
}

class Guide extends Model {
  constructor(id = -1) {
    super(id, "guide");
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
  }

  setGuide = (coordinate1) => {
    let black = new Color("#000000");
    let x = coordinate1.x;
    let y = coordinate1.y;
    this.vertices[0].coordinate = new Coordinate([x-3, y-3]);
    this.vertices[0].color = black;
    this.vertices[1].coordinate = new Coordinate([x+3, y-3]);
    this.vertices[1].color = black;
    this.vertices[2].coordinate = new Coordinate([x+3, y+3]);
    this.vertices[2].color = black;
    this.vertices[3].coordinate = new Coordinate([x-3, y+3]);
    this.vertices[3].color = black;
  }

  render = () => {
    const guideVertices = [];

    this.vertices.forEach((vertex) => {
      guideVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      guideVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      guideVertices.push(vertex.color.r / 255);
      guideVertices.push(vertex.color.g / 255);
      guideVertices.push(vertex.color.b / 255);
    });

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(guideVertices), gl.STATIC_DRAW);

    let indices = [0,1,2,2,3,0]; 

    let indexBufer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
  }
}

class CenterGuide extends Model {
  constructor(id = -1) {
    super(id, "centerguide");
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
    this.addVertex(new Coordinate(), new Color());
  }

  setCenterGuide = (coordinate1) => {
    let black = new Color("#000000");
    let white = new Color("#ffffff");
    let x = coordinate1.x;
    let y = coordinate1.y;
    this.vertices[0].coordinate = new Coordinate([x-4, y-4]);
    this.vertices[0].color = black;
    this.vertices[1].coordinate = new Coordinate([x+4, y-4]);
    this.vertices[1].color = black;
    this.vertices[2].coordinate = new Coordinate([x+4, y+4]);
    this.vertices[2].color = black;
    this.vertices[3].coordinate = new Coordinate([x-4, y+4]);
    this.vertices[3].color = black;
    this.vertices[4].coordinate = new Coordinate([x-3, y-3]);
    this.vertices[4].color = white;
    this.vertices[5].coordinate = new Coordinate([x+3, y-3]);
    this.vertices[5].color = white;
    this.vertices[6].coordinate = new Coordinate([x+3, y+3]);
    this.vertices[6].color = white;
    this.vertices[7].coordinate = new Coordinate([x-3, y+3]);
    this.vertices[7].color = white;
  }

  render = () => {
    const guideVertices = [];

    this.vertices.forEach((vertex) => {
      guideVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      guideVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      guideVertices.push(vertex.color.r / 255);
      guideVertices.push(vertex.color.g / 255);
      guideVertices.push(vertex.color.b / 255);
    });

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(guideVertices), gl.STATIC_DRAW);

    let indices = [0,1,2,2,3,0, 4, 5, 6, 6, 7, 4]; 

    let indexBufer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
  }
}