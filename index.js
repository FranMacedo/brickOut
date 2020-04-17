var canvas;
var ctx;
var screenWidth;	
var screenHeight;
var ballX = 50;
var ballY = 50;


var ballSpeedX = 15;
var ballSpeedY = 8;

var playerLost = 0;
const WINNING_SCORE = 3;

var showWinScreen = false;

const PADDLE_WIDTH = 150;
const PADDLE_THICKNESS = 20;
const PADDLE_MARGIN = 100;

const BALL_RADIUS = 10;

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_COLS = 10;
const BRICK_ROWS = 10;
const BRICK_GAP = 2;
const BRICK_THICKNESS = 10;


var brickGrid = new Array(BRICK_COLS*BRICK_ROWS);
var bricksLeft;

var paddleX;
var paddleY;


function calculateMousePos (evt){
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	var mouseX = evt.clientX - rect.left -root.scrollLeft;
	var mouseY = evt.clientY - rect.top -root.scrollTop;

	return {
			x: mouseX,
			y: mouseY
	}
}


window.onload = function(){

	canvas = document.getElementById('gameCanvas');
	//var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
	//canvas.width = dimension[0]*0.98;
	//canvas.height = dimension[1]*0.91;

	ctx = canvas.getContext('2d');
	ctx.font = "30px Arial";
	screenWidth = canvas.width;
	screenHeight = canvas.height;
	paddleX = screenWidth/2- PADDLE_WIDTH/2;
	paddleY = screenHeight - PADDLE_MARGIN - PADDLE_THICKNESS;
	// BRICK_WIDTH = screenWidth/20;
	var framesPerSecond = 30;
	setInterval(function(){
		moveEverything();		
		drawEverything ();

	}, 1000/framesPerSecond);

	canvas.addEventListener('mousemove',
		function(evt) {
				var mousePos = calculateMousePos(evt);
				paddleX = mousePos.x - PADDLE_WIDTH/2;
				// ballX = mousePos.x - BALL_RADIUS;
				// ballY = mousePos.y - BALL_RADIUS;

		}
	);

	resetBricks();
	ballReset();

}
function ballReset() {

		
	ballX = canvas.width/2;
	ballY = canvas.height/2;

}

function moveEverything() {
	console.log(bricksLeft);
	if (showWinScreen){
			return;
	}
	
	// ball hits left wall 
	if (ballX - BALL_RADIUS < 0){
		ballSpeedX = -ballSpeedX;
	}		

	// ball hits right wall 
	if(ballX + BALL_RADIUS> screenWidth){
		ballSpeedX = -ballSpeedX;
	}

	// ball hits bottom or paddle
	if(ballSpeedY > 0.0) {
		if (ballY  + BALL_RADIUS >= paddleY && ballY + BALL_RADIUS <= paddleY + PADDLE_THICKNESS){
			// hits paddle

		
			if (ballX > paddleX &&
			    ballX < paddleX + PADDLE_WIDTH){
				
				ballSpeedY = -ballSpeedY;

				if (bricksLeft == 0){
					console.log('aqui!')
					resetBricks();
				}
				
				var deltaX = ballX - (paddleX+PADDLE_WIDTH/2);
				ballSpeedX = deltaX *0.35;
			}
			// hits bottom
		
			
		}
	}
	if(ballY + BALL_RADIUS> screenHeight){

		playerLost++; // must be BEFORE ballReset
		ballReset();
	}
			

	// ball hits ceiling 	
	if (ballY - BALL_RADIUS< 0){
		ballSpeedY *= -1;
	}

	breakAndBounceOffBrickAtPixelCoord(ballX, ballY);
	

	ballX += ballSpeedX;
	ballY += ballSpeedY;

}

function drawBricks(){

	for(var eachCol=0; eachCol<BRICK_COLS; eachCol++){
		for(var eachRow=0; eachRow<BRICK_ROWS; eachRow++){
			if (isBrickAtTileCoord(eachCol, eachRow)){
				var brickLeftEdgeX = eachCol*BRICK_W;
				var brickTopEdgeY = eachRow*BRICK_H;
				colorRect(brickLeftEdgeX, brickTopEdgeY, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue')
			}
		}
	}

	// para desenhar bricks com o mesmo espaçamento, no inicio e no fim
	//n = screenWidth/BRICK_WIDTH*0.9
	//buffer = (screenWidth - n*BRICK_WIDTH)/(n+1)
	//for (var i=buffer; i<screenWidth-buffer; i+=BRICK_WIDTH + buffer){
	//	colorRect(i, 10, BRICK_WIDTH, BRICK_THICKNESS, 'white')
	//}

}

function breakAndBounceOffBrickAtPixelCoord(pixelX, pixelY){
	var tileCol = pixelX / BRICK_W;
	var tileRow = pixelY / BRICK_H;

	var tileCol = Math.floor(tileCol);
	var tileRow = Math.floor(tileRow);	

	// check if ball is within grid and if not, avoid any remove action
	if (tileCol < 0 || tileCol >= BRICK_COLS ||
	 	tileRow<0 || tileRow> BRICK_ROWS){
		return false
	}

	var brickIndex = brickTileToIndex (tileCol, tileRow);

	if (brickGrid[brickIndex] == 1){ // we overlapped a brick

		// checking where the ball comes from
		var prevBallX = ballX - ballSpeedX;
		var prevBallY = ballY - ballSpeedY;

		var prevTileCol = Math.floor(prevBallX/BRICK_W);
		var prevTileRow = Math.floor(prevBallY/BRICK_H);

		bothTestsFailed = true;
		if (prevTileCol != tileCol){ // came horizontally

			var adjacentBrickIndex = brickTileToIndex(prevTileCol, tileRow);
			if (brickGrid[adjacentBrickIndex] != 1){ //side is not blocked
				ballSpeedX *= -1;
				bothTestsFailed = false;

			}

		}

		if (prevTileRow != tileRow){ // came vertically

			var adjacentBrickIndex = brickTileToIndex(tileCol, prevTileRow);
			if (brickGrid[adjacentBrickIndex] != 1){ //bottom/top is not blocked
				ballSpeedY *= -1;
				bothTestsFailed = false;

			}

		}

		if (bothTestsFailed){
				ballSpeedY *= -1;
				ballSpeedX *= -1;

		}
		brickGrid[brickIndex] = 0;
		bricksLeft--;
	}
}


function resetBricks(){
	bricksLeft = 0;
	for (var i=0; i<BRICK_COLS*BRICK_ROWS; i++){
			if (i/BRICK_COLS < 3){
				brickGrid[i] = 0;
			} 
			else{
				brickGrid[i] = 1;
				bricksLeft++;
			}
		// if(Math.random()< 0.5){
		// 	brickGrid[i] = 1;
		// }
		// else{
		// 	brickGrid[i] = 0;
		// }
	}
}

function brickTileToIndex(tileCol, tileRow) {
	return (tileCol + BRICK_COLS*tileRow);

}

function isBrickAtTileCoord(brickTileCol, brickTileRow){
	// returns true if brick is visible in grid

	// to find index position in array given grid row and col position
	var brickIndex = brickTileToIndex(brickTileCol, brickTileRow);
	return (brickGrid[brickIndex] == 1);
}

function drawEverything() {

	// blanks out screen with black
	colorRect(0,0, screenWidth, screenHeight, 'black');

	// ctx.fillStyle = 'white';		
	// if (showWinScreen){
	// 	if (player1Score >= WINNING_SCORE){
	// 				var winTxt = "Player 1 wins!"
	// 			}
	// 	else{
	// 		var winTxt = "Player 2 wins!"
	// 	}
	// 	var continuTxt = "click to continue";

	// 	txtWidth1 = ctx.measureText(winTxt).width;
	// 	txtWidth2 = ctx.measureText(continuTxt).width;
	// 	txtWidth = Math.max(txtWidth1, txtWidth2);
		
	// 	ctx.fillText(winTxt, screenWidth/2 - txtWidth/2, screenHeight*0.2);				
	// 	ctx.fillText(continuTxt, screenWidth/2 - txtWidth/2, screenHeight*0.8);

	// 	return;
	// }

	// creates main paddle
	colorRect(paddleX,paddleY, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');

	
	// creates bricks
	drawBricks();
	//colorRect(screenWidth/2,screenHeight/2, BRICK_WIDTH, BRICK_THICKNESS, 'white');




	// creates ball
	colorCircle(ballX, ballY, BALL_RADIUS, 'white');

	//ctx.fillText(player1Score, screenWidth/2/2, screenHeight*0.1);
	//ctx.fillText(player2Score, screenWidth/2 + screenWidth/2/2, screenHeight*0.1);


}




function colorCircle(centerX, centerY, radius, drawColor){

	ctx.fillStyle = drawColor;
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI*2, true);
	ctx.fill();

}
function colorRect(leftX, topY, width, height, drawColor){
	ctx.fillStyle = drawColor;
	ctx.fillRect(leftX,topY, width, height);

}