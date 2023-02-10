const vertexShaderText = 
`precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor;

void main() {
  fragColor = vertColor;
  gl_Position = vec4(vertPosition, 0.0, 1.0);
}`;

const fragmentShaderText = 
`precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}`;

const createShader = (gl, type, text) => {
  // Create shader
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, text);

  // Compile the shader program
  gl.compileShader(shader);

  // Check for errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`ERROR compiling ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader! ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return;
  }
  return shader;
}

const createProgram = (gl, vertexShader, fragmentShader) => {
  // Create program
  const program = gl.createProgram();

  // Attach shaders
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link program
  gl.linkProgram(program);

  // Check for errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`ERROR linking program! ${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error(`ERROR validating program! ${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    return;
  }
  return program;
}

var gl = canvas.getContext('webgl');

if (!gl) {
  alert('Unable to initialize WebGL. Your browser or machine may not support it.');
  // return;
}

// Set viewport and clear color
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Create shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

// Create program
const program = createProgram(gl, vertexShader, fragmentShader);

// Create buffer
var triangleVertices =
[ // X, Y,       R, G, B
0.0, 0.5,    1.0, 0.0, 0.0,
-0.5, -0.5,  0.0, 1.0, 0.0,
0.5, -0.5,   0.0, 0.0, 1.0
];

var triangleVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

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

// Main render loop
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);