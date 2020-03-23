/**
 * Group #3
 * 
 * Student Names: Isaac Murisa  201534328
 *                Shamiso Jaravaza 201522448
 * 
 */

 /**
  * We have not managed to print 5 objectes in the same canvas, hence we created a cube and a tetrahedron as well.
  * we did not manage to have have th eorhtogonal view wotking proparly, the code is included but it has some bugs.
  * There are errors when running the program therefore we suggest reloading the assignment page everytime you wish to switch 
  *   to a new transformation (rotation, translation etc) or view (perspective or orthogonal)
  * We managed to have the projection respond to WASD key press once the "Perspective view is selected"
  * We managed to implement all the required transformations: i.e. rotation, transformation, uniform scaling and non-uniform scaling in
  *   all directions as well as moving shape back and forth. Though to successfult view this, the page has to be reloaded everytime to switch
  *   to a different transformation or view.
  * 
  * All the code has been documented below, both what is running and what has bugs. 
  */


// variables for system.
var gl;
var points = [];
var colors = [];

var vModelViewMatrix, vProjectionMatrix;
var modelViewMatrix, projectionMatrix;

// orthogonal viewing variables
var near = -1;
var far = 1;
var radius = 1.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;
// perspective viewing variables
var pnear = 0.1;
var pfar = 1000.0;
var pradius = 3.0;
var ptheta = 0.0;
var pphi = 0.0;
var pdr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

// orthogonal viewing
var left = -1.0;
var right = 1.0;
var top = 1.0;
var bottom = -1.0;

var mv = new mat4();
var p = new mat4();

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// variables use by the tranfornations
var model_trans = "orthogonal";
var num = 0.1;
var y_point = 1;
var x_point = 1;

/**
 * Init() function
 */
window.onload = function init() {
  var canvas = document.getElementById( "gl-canvas" );
  gl = canvas.getContext('webgl2'); 

  if ( !gl ) { 
    alert( "WebGL isn't available" ); 
  }

  // populate indices for cube
  cubeIndices();

  //  Configure WebGL  
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

  aspect =  canvas.width/canvas.height;
  // Depth Test
  gl.enable(gl.DEPTH_TEST);

  // programs

  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );

  gl.useProgram( program );     

  /**
   * Buffer objects
   */
  
  // ---------------Color Buffer-------------------
  // load the data into gpu
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // Associate color with buffer data
  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  // ---------------Vertices------------------
  // Load the data into the GPU        
  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);   //change when vertices

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );    

  // pass model view matrix to vertex shader
  vModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  vProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

  render();
};

/**
 * Render functions
 */
function render() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); 
  /**
   * Below are the required transformations
   */

  if (model_trans == "perspective") {
    // perspective projection lookat() function variables
    eye = vec3(pradius * Math.sin(ptheta)*Math.cos(pphi), pradius * Math.sin(ptheta) * Math.sin(pphi), pradius * Math.cos(ptheta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, pnear, pfar);

    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(projectionMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimationFrame(render);
  }
  else if (model_trans == "orthogonal") {
    // orthogonal projection function lookat() variables
    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius*Math.cos(phi));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);

    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(projectionMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimationFrame(render);
  }

  // Different transformations
  else if (model_trans == "rotation") {
    mv = mult( mv, rotate(2.0,vec3(0,1,0)) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimationFrame(render);
  }
  // Uniform scale on all x-axis
  // scale the shape on all axis
  else if (model_trans == "uniformScale") {
    mv = mult( mv, scale(1.5, 1.5, 1.5) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }
  // Non-uniform scaling X-direction
  // scale the shape by x axis
  else if (model_trans == "uniformXScale") {
    mv = mult( mv, scale(1.5, 1, 1) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }
  // Non-uniform scaling Y-direction
  // scale the shape by y axis
  else if (model_trans == "uniformYScale") {
    mv = mult( mv, scale(1, 1.5, 1) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }
  // Non-uniform scaling z-direction
  // scale the shape by y axis
  else if (model_trans == "uniformZScale") {
    mv = mult( mv, scale(1, 1, 1.5) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }
  // transformation
  else if (model_trans == "transform") {
    num = num * -1;
    mv = mult( mv, translate(0, num, 0) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
  }
  // moving back and forth between two points
  else if (model_trans == "backandforth") {
    mv = mult( mv, translate(x_point, y_point, 0) );
    gl.uniformMatrix4fv(vModelViewMatrix, false, flatten(mv));
    gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(p));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimationFrame(render);
    // makes shape return to previous postion.
    x_point = x_point * -1;
    y_point = y_point * -1;
  }
};


/**
 * Cube function. Add cube vertices to points
 */
function Cube(a, b, c, d) {
  points.push(vertices[a]);
  colors.push(faceColors[a])
  points.push(vertices[b]);
  colors.push(faceColors[a])
  points.push(vertices[c]);
  colors.push(faceColors[a])
  points.push(vertices[a]);
  colors.push(faceColors[a])
  points.push(vertices[c]);
  colors.push(faceColors[a])
  points.push(vertices[d]);
  colors.push(faceColors[a])
};

// cube vertices
const vertices = [
  vec4( -0.5, -0.5, 0.5, 1.0 ),
  vec4( -0.5, 0.5, 0.5, 1.0 ),
  vec4( 0.5, 0.5, 0.5, 1.0 ),
  vec4( 0.5, -0.5, 0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5, 0.5, -0.5, 1.0 ),
  vec4( 0.5, 0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 )
];

// cube colors
const faceColors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0),  // cyan
  vec4(1.0, 1.0, 1.0, 1.0)   // white
];

/**
 * cube indices
 */
function cubeIndices(){
  Cube(1,0,3,2);
  Cube(2,3,7,6);
  Cube(3,0,4,7);
  Cube(6,5,1,2);
  Cube(4,5,6,7);
  Cube(5,4,0,1);
};


/**
 * Tetrahedrone function
 */
function Tetrahedrone(a, b, c) {
  s2points.push(tetraVertices[a]);
  s2colors.push(tetraFaceColors[a]);
  s2points.push(tetraVertices[b]);
  s2colors.push(tetraFaceColors[a]);
  s2points.push(tetraVertices[c]);
  s2colors.push(tetraFaceColors[a]);
};

//tetrahedron vertices
const tetraVertices = [
  vec4(0, 0.5, 0, 1.0),
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(0, -0.5, -0.5, 1.0)
];

// tetrahedron face colors
const tetraFaceColors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0),  // green
];

function tetraIndices() {
  Tetrahedrone(0, 1, 2);
  Tetrahedrone(1, 3, 0);
  Tetrahedrone(2, 3, 0);
  Tetrahedrone(3, 2, 1);
};

/**
 * Event handlers for key press
 */
document.onkeypress = function(event) {
  if (event.code=='KeyW') {  //W key
    pradius--;
  };
  if (event.code=='KeyS') {  //s key
    pradius++;
  };
  if (event.code=='KeyA') {  //a key
    ptheta--;
  };
  if (event.code=='KeyD') {  //D key
    ptheta++;
  };
};

/**
 * Event listener to change view when drop down is changed.
 */
function changeView() {
  var x = document.getElementById("view");
  model_trans = x.value;
  // render once the transformation has been selected.
  render();
};
