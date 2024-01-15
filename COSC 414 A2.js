// HelloTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  'gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n' +
  '}\n';

//Max bacteria to be created
var maxBacteria = 10;

//Bacteria colours
var BACTSHADER_SOURCE = new Array(maxBacteria);
//Store locations of bacteria centers
var bactOrigins = new Array(2*maxBacteria);
//Determine if alive
var isAlive = new Array(maxBacteria);
//Scoring
var pscore = 0;
var gscore = 0;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  //numBacteria is the number of bacteria to create, ensuring there's at least 2
  var numBacteria = Math.ceil(Math.random()*(maxBacteria-1))+1;
  //Count determines the current bacteria to create
  var count = 0;

  //Used to determine the current size of bacteria
  var currSize = new Array(numBacteria);
  //Determine growth speed
  var growthRate = new Array(numBacteria);
  for (var i = 0; i < numBacteria; i++){
    currSize[i] = 1;
    growthRate[i]= 1;
    isAlive[i]= true;
    //Uncomment below for extra challenge
    growthRate[i]= (Math.random() * 5);
  }

  //Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, numBacteria, currSize, canvas); };

  //Prepare bacteria to be drawn
  var bacteria = new Array(numBacteria);
  for (var i = 0; i < numBacteria; i++){
    bacteria[i] = getWebGLContext(canvas);
  }

  while (count < numBacteria){
      createBacteria(bacteria[count], count);
      count++;
    }

    var tick = function(){
      draw(gl, bacteria, count, currSize, growthRate, n);
      requestAnimationFrame(tick, canvas);
    }
    
    tick();
}

function initVertexBuffers(gl) {
  var n = 360; // The number of vertices
  var vertices = new Float32Array(n*2);

  var perimeter = (2*Math.PI)/n;

  for (var i = 0; i < n-1; i++){
    var angle = perimeter * (i+1);

    vertices[2*i] = 0.5 * Math.cos(angle); //x coordinates
    vertices[(2*i)+1] = 0.5 * Math.sin(angle); //y coordinates
  }

  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function createBacteria(gl, bactNum){
  var n = 360; // The number of vertices
  var vertices = new Float32Array(n*2);

  var perimeter = (2*Math.PI)/n;

  //Determine the bacteria's center
  var originVertex = Math.random() * 360;
  var originAngle = perimeter * originVertex;
  var originX = 0.5 * Math.cos(originAngle);
  var originY = 0.5 * Math.sin(originAngle);
  bactOrigins[2*bactNum] = originX;
  bactOrigins[(2*bactNum)+1] = originY;

  for (var i = 0; i < n-1; i++){
    var angle = perimeter * (i+1);

    vertices[2*i] = (0.001 * Math.cos(angle)) + originX; //x coordinates
    vertices[(2*i)+1] = (0.001 * Math.sin(angle))  + originY; //y coordinates
  }

  BACTSHADER_SOURCE[bactNum] =
  'void main() {\n' +
  '  gl_FragColor = vec4(' + Math.random() + ', ' + Math.random() + ', ' + Math.random() + ', 1.0);\n' +
  '}\n';

  initShaders(gl, VSHADER_SOURCE, BACTSHADER_SOURCE[bactNum]);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
}

//Helper function to draw everything as needed
function draw(gl, bacteria, count, currSize, growthRate, n){ 
  //Draw the white circle
  gl.clear(gl.COLOR_BUFFER_BIT);
  initVertexBuffers(gl);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  if (gscore >= 2){
    document.getElementById('win_lose').innerHTML = 'You lose!';
    document.getElementById('win_lose').style.color = "red";
    for (var i = 0; i < count; i++){
      isAlive[i] = false;
    }
  }

  //Increase bacteria size and draw
  for (var i = 0; i < count; i++){
    if (isAlive[i]){
      currSize[i] += growthRate[i];
      increaseSize(bacteria[i], currSize[i], i);
      gl.drawArrays(bacteria[i].TRIANGLE_FAN, 0, n);
    }
  }

}

//This function takes the origin point of the bacteria, and determines where the vertices should be the next time it is drawn.
function increaseSize(gl, size, bactNum){ 
  //Check if size meets the threshold
  if(size>=501){
    gscore++;
    document.getElementById('game_points').innerHTML = 'Game points: ' + gscore;
    //Kill winning bacteria to prevent the player from scoring
    isAlive[bactNum] = false;    
  }
  
  var n = 360; // The number of vertices
  var vertices = new Float32Array(n*2);

  var perimeter = (2*Math.PI)/n;

  for (var i = 0; i < n-1; i++){
    var angle = perimeter * (i+1);

    vertices[2*i] = ((size/1000) * Math.cos(angle)) + bactOrigins[2*bactNum]; //x coordinates
    vertices[(2*i)+1] = ((size/1000) * Math.sin(angle))  + bactOrigins[(2*bactNum)+1]; //y coordinates
  }

  initShaders(gl, VSHADER_SOURCE, BACTSHADER_SOURCE[bactNum]);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

}

function click(ev, numBacteria, currSize, canvas) {
  var mx = ev.clientX; // x coordinate of a mouse pointer
  var my = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;

  //Translate mx and my into canvas coordinates
  mx = ((mx - rect.left) - canvas.width/2)/(canvas.width/2);
  my = (canvas.height/2 - (my - rect.top))/(canvas.height/2);

  console.log(mx + "," + my);

  //i counts backwards so that the top layer of bacteria is checked first
  for (var i = numBacteria-1; i >=0; i--){
    if (isAlive[i]==true){
      var pos = Math.abs(mx - bactOrigins[i*2]) + Math.abs(my - bactOrigins[(i*2)+1]);
      console.log(pos);

      //Check if the position falls within the radius
      if (pos <= currSize[i]/1000){
        console.log(bactOrigins[i*2] + "," + bactOrigins[(i*2)+1]);
        pscore++;
        isAlive[i]=false;
        break;
      }
    }
  }

  //Record score
  document.getElementById('player_points').innerHTML = 'Player points: '+ pscore;

  //Check for player win
  if (pscore>=numBacteria-1){
    document.getElementById('win_lose').innerHTML = 'You win!';
    document.getElementById('win_lose').style.color = "green";

    for (var i = 0; i < numBacteria; i++){
      isAlive[i] = false;
    }
  }
  console.log("\n");
}