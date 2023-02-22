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
} else {
  console.log('WebGL initialized');
  // Set viewport and clear color
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

  // Create program
  var program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  // Render
  render();

  function render () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    models.forEach(model => {
      model.render();
    });
  
    if (modeLine || modeSquare || modeRectangle || modePolygon) {
      let guides = getGuidesofArr(models);
      guides.forEach(guide => {
        guide.render();
      });
    }

    if (tempModel.length) {
      tempModel[0].render();
    }

    if (modeLine || modeSquare || modeRectangle || modePolygon) {
      let guides = getGuidesofArr(tempModel);
      guides.forEach(guide => {
        guide.render();
      });
    }

    crosshair.forEach(cross => {
      cross.render();
    });
    
    window.requestAnimationFrame(render);
  }

}
