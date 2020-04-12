"use strict";

var canvas;
var gl;

var numVertices  = 24;
var maxNumParticles = 10000;
var initialNumParticles = 10;
var initialPointSize = 30;
var initialSpeed = 0.1;
var numColors = 8;

var program;

var time = 0;
var dt = 1;

var numParticles = initialNumParticles;
var pointSize = initialPointSize;
var speed = initialSpeed;
var gravity = false;
var elastic = false;
var repulsion = false;
var coef = 1.0;


var pointsArray = [];
var colorsArray =[];

var projectionMatrix, modelViewMatrix;
var eye;
var at;
var up;

var cBufferId, vBufferId;

//var buf = new Float32Array(10);
//buf.push(vec3(1.0, 2.0, 3.0));
//console.log(buf.index, buf);

var vertices = [

  vec4(-1.1, -1.1,  1.1, 1.0 ),
  vec4( -1.1,  1.1,  1.1, 1.0 ),
  vec4( 1.1,  1.1,  1.1, 1.0 ),
  vec4( 1.1, -1.1,  1.1, 1.0 ),
  vec4( -1.1, -1.1, -1.1, 1.0 ),
  vec4( -1.1,  1.1, -1.1, 1.0 ),
  vec4( 1.1,  1.1, -1.1, 1.0 ),
  vec4( 1.1, -1.1, -1.1, 1.0)
];

var vertexColors = [

    vec4(0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

;


function particle(){

    var p = {};
    p.color = vec4(0, 0, 0, 1);
    p.position = vec4(0, 0, 0, 1);
    p.velocity = vec4(0, 0, 0, 0);
    p.mass = 1;

    return p;
}

var particleSystem = [];

for(var i = 0; i< maxNumParticles; i++) particleSystem.push(particle());
//for(var i = 0; i< maxNumParticles; i++) particleSystem[i] = particle();


var d2 = []
for(var i=0; i<maxNumParticles; i++) d2[i] =  new Float32Array(maxNumParticles);

var bufferId;

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[0]);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    document.getElementById("Button1").onclick = function(){doubleNumParticles(); update();};
    document.getElementById("Button2").onclick = function(){numParticles /= 2; update();};
    document.getElementById("Button3").onclick = function(){speed *=2;update();};
    document.getElementById("Button4").onclick = function(){speed /= 2; update();};
    document.getElementById("Button5").onclick = function(){pointSize *= 2;gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize); update();};
    document.getElementById("Button6").onclick = function(){pointSize /= 2;gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize); update();};
    document.getElementById("Button7").onclick = function(){gravity = !gravity; update()};
    document.getElementById("Button8").onclick = function(){elastic = !elastic; update()};
    document.getElementById("Button9").onclick = function(){repulsion = !repulsion; update()};

    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //eye =  vec3(1.5, 1.0, 1.0);
    eye =  vec3(0.0, 0.0, 1.0);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(-2.0,2.0,-2.0,2.0,-4.0,4.0);

    gl.enable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix" ), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix" ), false, flatten(projectionMatrix)  );

    gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize);

    cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*(maxNumParticles+numVertices), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*(maxNumParticles+numVertices), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize);

    simulation();
}

var simulation = function(){

    // set up particles with random locations and velocities

    for ( var i = 0; i < numParticles; i++ ) {
        particleSystem[i].mass = 1.0;
        particleSystem[i].color = vertexColors[i % numColors];
        for ( var j = 0; j < 3; j++ ) {
            particleSystem[i].position[j] = 2.0 * (Math.random() - 0.5);
            particleSystem[i].velocity[j] = speed * 2.0 * (Math.random() - 0.5);
        }
        console.log(i, particleSystem[i].velocity);
        particleSystem[i].position[3] = 1.0;
    }

    gl.uniform1i(gl.getUniformLocation(program, "isParticle"), 1);

    for(var i =0; i<numParticles; i++) {
       pointsArray.push(particleSystem[i].position);
       colorsArray.push(particleSystem[i].color);
       }
    gl.uniform1i(gl.getUniformLocation(program, "isParticle"), 0);
    colorCube();


    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsArray));

    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));

    render();

}

var doubleNumParticles = function(){

    if(2*numParticles > maxNumParticles) return;
    for ( var i = 0; i < 2*numParticles; i++ ) {
        particleSystem[i].mass = 1.0;
        particleSystem[i].color = vertexColors[i % numColors];
        for ( var j = 0; j < 3; j++ ) {
            particleSystem[i].position[j] = 2.0 * (Math.random() - 0.5);
            particleSystem[i].velocity[j] = speed * 2.0 * (Math.random() - 0.5);
        }
        particleSystem[i].position[3] = 1.0;;
    }

       numParticles *= 2;

       update();
}

var forces = function( ParticleI)
{
    var ParticleK;
    var force = vec4(0, 0, 0, 0);
    if ( gravity) force[0] = -0.5;
    //console.log(gravity, force);          /* simple gravity */
    if ( repulsion )
        for ( var ParticleK = 0; ParticleK < numParticles; ParticleK++ ) { /* repulsive force */
            if ( ParticleK != ParticleI ){
               var t =
                 normalize(subtract(particleSystem[ParticleI].position,
                              particleSystem[ParticleK].position));
                var d2 = dot(t, t);
                force = add(force, scale(0.01/d2, t));
                }
        }
    return ( force );
}

var collision = function(particleId) {

/* tests for collisions against cube and reflect particles if necessary */

    if(elastic) coef = 0.9; else coef = 1.0;
    for (var i = 0; i < 3; i++ ) {
        if ( particleSystem[particleId].position[i] >= 1.0 ) {
            particleSystem[particleId].velocity[i] = -coef * particleSystem[particleId].velocity[i];

            particleSystem[particleId].position[i] =
                1.0 - coef * ( particleSystem[particleId].position[i] - 1.0 );
        }
        if ( particleSystem[particleId].position[i] <= -1.0 ) {
            particleSystem[particleId].velocity[i] = -coef * particleSystem[particleId].velocity[i];

            particleSystem[particleId].position[i] =
                -1.0 - coef * ( particleSystem[particleId].position[i] + 1.0 );
        }
    }
}


var update = function(){
    for (var i = 0; i < numParticles; i++ ) {
            //console.log("position before ", particleSystem[i].position);
            particleSystem[i].position = add( particleSystem[i].position, scale(speed*dt, particleSystem[i].velocity));
            //console.log("position after ", particleSystem[i].position);
            //console.log("velocity before ", particleSystem[i].velocity);
            particleSystem[i].velocity = add( particleSystem[i].velocity, scale(speed*dt/ particleSystem[i].mass, forces(i)));
            //console.log("velocity after ", particleSystem[i].velocity);
            //console.log(forces(i));
            //particleSystem[i].position = add( particleSystem[i].position, scale(speed*dt, particleSystem[i].velocity));
        }
    for (var i = 0; i < numParticles; i++ ) collision(i);
    pointsArray = [];
    colorsArray = [];
    for(var i = 0; i<numParticles; i++) {
       pointsArray.push(particleSystem[i].position);
       colorsArray.push(particleSystem[i].color);
    }
    colorCube();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(pointsArray));
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(colorsArray));
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    update();
    gl.uniform1i(gl.getUniformLocation(program, "isParticle"), 1.0);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.uniform1i(gl.getUniformLocation(program, "isParticle"), 0.0);
    for ( var i = 0; i < 6; i++ ) gl.drawArrays( gl.LINE_LOOP, numParticles + i * 4, 4 );
    requestAnimationFrame(render);
}