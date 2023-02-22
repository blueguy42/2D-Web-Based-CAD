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
}

class Model {
  constructor(id = -1, type="") {
    this.id = id;
    this.vertices = [];
    this.type = type;
  }

  addVertex = (coordinate, color) => {
    this.vertices.push(new Point(coordinate, color, this.vertices.length));
  }

  getVertexCount = () => this.vertices.length;
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

  }
  
  setLine = (coordinate1, color1, coordinate2, color2) => {
    this.vertices[0].coordinate = coordinate1;
    this.vertices[0].color = color1;
    this.vertices[1].coordinate = coordinate2;
    this.vertices[1].color = color2;

    this.guides[0].setGuide(coordinate1);
    this.guides[1].setGuide(coordinate2);
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

class Polygon extends Model {
  constructor(id = -1) {
    super(id, "polygon");
    this.guides = [];
  }

  addCorner = (coordinate1, color1) => {
    this.addVertex(coordinate1, color1);
    let guide1 = new Guide(this.vertices.length);
    guide1.setGuide(coordinate1);
    this.guides.push(guide1);
  }

  setLastCorner = (coordinate1, color1) => {
    this.vertices[this.vertices.length-1].coordinate = coordinate1;
    this.vertices[this.vertices.length-1].color = color1;
    this.guides[this.guides.length-1].setGuide(coordinate1);
  }

  render = () => {
    const polygonVertices = [];

    this.vertices.forEach((vertex) => {
      polygonVertices.push(getCanvastoWebGL_X(canvas, vertex.coordinate.x));
      polygonVertices.push(getCanvastoWebGL_Y(canvas, vertex.coordinate.y));
      polygonVertices.push(vertex.color.r / 255);
      polygonVertices.push(vertex.color.g / 255);
      polygonVertices.push(vertex.color.b / 255);
    });

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygonVertices), gl.STATIC_DRAW);

    let indices = [];
    console.log(this.vertices.length); 
    if (this.vertices.length > 2) {
      for (let i = 0; i < this.vertices.length-2; i++) {
        indices.push(i);
        indices.push(i+1);
        indices.push(i+2);
      }
      let indexBufer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

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
      gl.drawArrays(gl.POINTS, 0, this.vertices.length);
    } else if (this.vertices.length == 2) {
      gl.drawArrays(gl.LINES, 0, this.vertices.length);
    } else {
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
    }
  }
}