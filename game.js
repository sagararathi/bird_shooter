var WIDTH = 1024;
var HEIGHT = 768;
var mouseXPosition;
var mouseYPosition;
var xEnemyPos=100;
var yEnemyPos=100;
var xEnemySpeed = 1.5;
var yEnemySpeed = 1.75;
var batImage;
var stage;
var animation;
var deathAnimation;
var spriteSheet;

var score = 0;
var scoreText;
var gameTimer;
var gameTime = 0;
var timerText;

var context;
var queue;
  // Set up the Canvas with Size and height

window.onload = function()
{
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

   // Set up the Asset Queue and load sounds

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);

   // load manifest for all assets


    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/shot.mp3'},
        {id: 'background', src: 'assets/countryside.mp3'},
        {id: 'gameOverSound', src: 'assets/gameOver.mp3'},
        {id: 'tick', src: 'assets/tick.mp3'},
        {id: 'deathSound', src: 'assets/die.mp3'},
        {id: 'batSpritesheet', src: 'assets/batSpritesheet.png'},
        {id: 'batDeath', src: 'assets/batDeath.png'},
    ]);
    queue.load();


    // Create a timer that updates once per second

    gameTimer = setInterval(updateTime, 1000);

}

function queueLoaded(event)
{
    // background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"))
    stage.addChild(backgroundImage);

    //Score
    scoreText = new createjs.Text("1UP: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //Timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "36px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);

    //background sound
    createjs.Sound.play("background", {loop: -1});

    // Create bat spritesheet
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('batSpritesheet')],
        "frames": {"width": 198, "height": 117},
        "animations": { "flap": [0,4] }
    });

    // Create bat death spritesheet
    batDeathSpriteSheet = new createjs.SpriteSheet({
      "images": [queue.getResult('batDeath')],
      "frames": {"width": 198, "height" : 148},
      "animations": {"die": [0,7, false,1 ] }
    });

    // Create bat sprite
    createEnemy();


    // Add ticker
    createjs.Ticker.setFPS(15);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    // Set up events AFTER the game is loaded
   // window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
}

function createEnemy()
{
  animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 99;
    animation.regY = 58;
    animation.x = xEnemyPos;
    animation.y = yEnemyPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function batDeath()
{
  deathAnimation = new createjs.Sprite(batDeathSpriteSheet, "die");
  deathAnimation.regX = 99;
  deathAnimation.regY = 58;
  deathAnimation.x = xEnemyPos;
  deathAnimation.y = yEnemyPos;
  deathAnimation.gotoAndPlay("die");
  stage.addChild(deathAnimation);
}

function tickEvent()
{
  //Make sure enemy bat is within game boundaries and move enemy Bat
  if(xEnemyPos < WIDTH && xEnemyPos > 0)
  {
    xEnemyPos += xEnemySpeed;
  } else
  {
    xEnemySpeed = xEnemySpeed * (-1);
    xEnemyPos += xEnemySpeed;
  }
  if(yEnemyPos < HEIGHT && yEnemyPos > 0)
  {
    yEnemyPos += yEnemySpeed;
  } else
  {
    yEnemySpeed = yEnemySpeed * (-1);
    yEnemyPos += yEnemySpeed;
  }

  animation.x = xEnemyPos;
  animation.y = yEnemyPos;
}

function handleMouseDown(event)
{

    //Display CrossHair
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    crossHair.x = event.clientX-45;
    crossHair.y = event.clientY-45;
    stage.addChild(crossHair);
    createjs.Tween.get(crossHair).to({alpha: 0},1000);

    //Play Gunshot sound
    createjs.Sound.play("shot");

    //Increase speed of enemy slightly
    xEnemySpeed *= 1.05;
    yEnemySpeed *= 1.06;

    //Obtain Shot position
    var shotX = Math.round(event.clientX);
    var shotY = Math.round(event.clientY);
    var spriteX = Math.round(animation.x);
    var spriteY = Math.round(animation.y);

    // Compute the X and Y distance using absolte value
    var distX = Math.abs(shotX - spriteX);
    var distY = Math.abs(shotY - spriteY);

    // Anywhere in the body or head is a hit - but not the wings
    if(distX < 30 && distY < 59 )
    {
      //Hit
      stage.removeChild(animation);
      batDeath();
      score += 100;
      scoreText.text = "1UP: " + score.toString();
      createjs.Sound.play("deathSound");

        //Make it harder next time
      yEnemySpeed *= 1.25;
      xEnemySpeed *= 1.3;

      //Create new enemy
      var timeToCreate = Math.floor((Math.random()*3500)+1);
      setTimeout(createEnemy,timeToCreate);

    } else
    {
      //Miss
      score -= 10;
      scoreText.text = "1UP: " + score.toString();

    }
}

function updateTime()
{
  gameTime += 1;
  if(gameTime > 60)
  {
    //End Game and Clean up
    timerText.text = "GAME OVER";
    stage.removeChild(animation);
    stage.removeChild(crossHair);
        createjs.Sound.removeSound("background");
        var si =createjs.Sound.play("gameOverSound");
    clearInterval(gameTimer);
  }
  else
  {
    timerText.text = "Time: " + gameTime
    createjs.Sound.play("tick");
  }
}
