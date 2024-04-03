"use strict";

//Variables

//Game Objects
let player;
let bullet1;
let bullet2;
let bullet3;
let crosshair;
let grass1;
let grass2;
let grass3;
let grass4;
let grass5;
let grass6;
let grass7;
let grass8;
let grass9;

//Game Objects Arrays
let bullets;
let zombies = [];
let grassArray = [];

//Player Movement Variables
let moveForward;
let moveBackwards;
let angle;
let movementSpeed = 0.5;

//Zombie Variables
let zombiesWaitTime = [];
let zombiesAnimationPosition = [];
let zombiesPlayerCollision = [];
let spawnZombiesInterval;

//Score Variables
let highscore = 0;
let score = 0;

//Game play variables
let gameOver = false;
let restartScreen;

//Shoot variables
let bulletAngle;
let bulletSpeed = 20;
let canShoot = true;
let shootAnimationOver = true;
let bulletActive = false;

//Grass variables
let currentMaxX = 1280;
let currentMinX = -1280;
let currentMaxY = 720;
let currentMinY = -720;

//Animation variables
let playerSprite = "images/Top_Down_Survivor/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";
let zombieSprite = "images/tds_zombie/export/Movement/skeleton-move_0.png";
let imagesScale = 0.4;

let playerMovementAnimation = [];
for(let i = 0; i<20;i++)
{
    playerMovementAnimation.push(new Image());
    playerMovementAnimation[i].src = "images/Top_Down_Survivor/Top_Down_Survivor/shotgun/move/survivor-move_shotgun_"+i.toString()+".png";
}

let playerShootAnimation = [];
for(let i = 0; i<3;i++)
{
    playerShootAnimation.push(new Image());
    playerShootAnimation[i].src = "images/Top_Down_Survivor/Top_Down_Survivor/shotgun/shoot/survivor-shoot_shotgun_"+i.toString()+".png";
}

let playerIdleAnimation = [];
for(let i = 0; i<20;i++)
{
    playerIdleAnimation.push(new Image());
    playerIdleAnimation[i].src = "images/Top_Down_Survivor/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_"+i.toString()+".png";
}

let zombieMovementAnimation = [];
for(let i = 0; i<16;i++)
{
    zombieMovementAnimation.push(new Image());
    zombieMovementAnimation[i].src = "images/tds_zombie/export/Movement/skeleton-move_"+i.toString()+".png";
}

let zombieAttackAnimation = [];
for(let i = 0; i<8;i++)
{
    zombieAttackAnimation.push(new Image());
    zombieAttackAnimation[i].src = "images/tds_zombie/export/Attack/skeleton-attack_"+i.toString()+".png";
}

function startGame()
{
    GameArea.start();

    //Initialize Game Objects
    player = new Component(313*imagesScale,207*imagesScale,playerSprite,640-(313*imagesScale)/2,360-(202*imagesScale)/2,"player",0);
    grass1 = new Component(1280,720,"images/grass.png",-1280,720,"grass");
    grass2 = new Component(1280,720,"images/grass.png",0,720,"grass");
    grass3 = new Component(1280,720,"images/grass.png",1280,720,"grass");
    grass4 = new Component(1280,720,"images/grass.png",-1280,0,"grass");
    grass5 = new Component(1280,720,"images/grass.png",0,0,"grass");
    grass6 = new Component(1280,720,"images/grass.png",1280,0,"grass");
    grass7 = new Component(1280,720,"images/grass.png",-1280,-720,"grass");
    grass8 = new Component(1280,720,"images/grass.png",0,-720,"grass");
    grass9 = new Component(1280,720,"images/grass.png",1280,-720,"grass");
    bullet1 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    bullet2 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    bullet3 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    crosshair = new Component(40,40,"images/crosshair097.png",640,360,"image");
    restartScreen = new Component(1280,720,"images/Game Over.png", 0,0,"image");
    bullets = [bullet1,bullet2,bullet3];
    grassArray = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9];

    //Reset Game
    zombies = [];
    spawnZombiesInterval = setInterval(spawnZombie, getRandomInterval());
    score = 0;
    gameOver = false;

    //Get Input
    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    window.addEventListener("mousedown", Shoot);


}

//Create Canvas
let GameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(GameArea.interval);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "Game-Window";

        //Put the canvas underneath the Game Title
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        let h1Element = document.querySelector("h1.Game-Title");
        h1Element.insertAdjacentElement("afterend", this.canvas);
    },

    clear: function() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}

//Create Game Components
function Component(width, height, source, x, y, type, angle=0){
    this.type = type;
    this.angle = angle;

    if (type === "image" || type === "grass") {
        this.image = new Image();
        this.image.src = source;
    }
    else if (type === "player") {
        this.image = new Image();
        this.image.src = playerSprite;
    }
    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;


    this.update = function(){

        let ctx = GameArea.context;

        //Score text and High score text
        if(gameOver === false)
        {
            ctx.font = "50px Comic Sans MS";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(score.toString(), 640, 100);
        }
        else{
            ctx.font = "60px Comic Sans MS";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("High Score: " + highscore.toString(), 640, 700);
        }

        ctx.save();

        // Rotate the player image based on the angle
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        //Images and Animated Images
        if(type === "image")
        {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        else if(type === "player")
        {
            this.image.src = playerSprite;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        else if(type === "grass")
        {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);

            if(moveForward){
                // Movement & Idle animation
                if(!shootAnimationOver)
                {
                    playerShootAnimationFunction();
                }
                else {
                    playerMovementAnimationFunction()
                }

                //Move player
                this.x -= movementSpeed*10 * Math.cos(player.angle);
                this.y -= movementSpeed*10 * Math.sin(player.angle);

                //Move other game objects when moving player
                bullet1.x -= movementSpeed * Math.cos(bulletAngle);
                bullet1.y -= movementSpeed * Math.sin(bulletAngle);

                bullet2.x -= movementSpeed * Math.cos(bulletAngle);
                bullet2.y -= movementSpeed * Math.sin(bulletAngle);

                bullet3.x -= movementSpeed * Math.cos(bulletAngle);
                bullet3.y -= movementSpeed * Math.sin(bulletAngle);

                for(let i = 0; i<zombies.length; i++)
                {
                    zombies[i].x -= movementSpeed * Math.cos(player.angle);
                    zombies[i].y -= movementSpeed * Math.sin(player.angle);
                }

                //Infinite grass
                if(grassArray[4].x+currentMaxX>currentMaxX)
                {
                    moveLeft();
                    currentMaxX+=1280;
                }
                else if(grassArray[4].x+currentMinX < currentMinX)
                {
                    moveRight();
                    currentMinX-=1280;
                }

                if(grassArray[4].y+currentMaxY > currentMaxY)
                {
                    moveDown();
                    currentMaxY+=720;
                }
                else if(grassArray[4].y+currentMinY < currentMinY)
                {
                    moveUp();
                    currentMinY-=720;
                }
            }
            else if(moveBackwards){

                // Movement & Idle animation
                if(!shootAnimationOver)
                {
                    playerShootAnimationFunction();
                }
                else {
                    playerMovementAnimationFunction()
                }

                //Move player
                this.x += movementSpeed * Math.cos(player.angle);
                this.y += movementSpeed * Math.sin(player.angle);

                //Move other game objects when moving player
                bullet1.x += movementSpeed * Math.cos(bulletAngle);
                bullet1.y += movementSpeed * Math.sin(bulletAngle);

                bullet2.x += movementSpeed * Math.cos(bulletAngle);
                bullet2.y += movementSpeed * Math.sin(bulletAngle);

                bullet3.x += movementSpeed * Math.cos(bulletAngle);
                bullet3.y += movementSpeed * Math.sin(bulletAngle);

                for(let i = 0; i<zombies.length; i++)
                {
                    zombies[i].x += movementSpeed * Math.cos(player.angle);
                    zombies[i].y += movementSpeed * Math.sin(player.angle);
                }

                //Infinite grass
                if(grassArray[4].x+currentMaxX>currentMaxX)
                {
                    moveLeft();
                    currentMaxX+=1280;
                }
                else if(grassArray[4].x+currentMinX < currentMinX)
                {
                    moveRight();
                    currentMinX-=1280;
                }

                if(grassArray[4].y+currentMaxY > currentMaxY)
                {
                    moveDown();
                    currentMaxY+=720;
                }
                else if(grassArray[4].y+currentMinY < currentMinY)
                {
                    moveUp();
                    currentMinY-=720;
                }
            }
            else{
                //Shoot animation & Idle Animation
                if(shootAnimationOver)
                {
                    playerIdleAnimationFunction();
                }
                else{
                    playerShootAnimationFunction();
                }
            }
        }
        ctx.restore();
    }
}

function updateGameArea(){
    GameArea.clear();

    //Game context
    let ctx = GameArea.context;
    ctx.fillText(score.toString(), 640, 60);

    //On mouse moved:
    onmousemove = function(e) {
        //Find players rotation
        let rect = GameArea.canvas.getBoundingClientRect();
        angle = Math.atan2(e.clientY-rect.top - player.y-150/2, e.clientX-rect.left - player.x-256/2);
        player.angle = angle;

        //Set crosshair's position
        crosshair.x = e.clientX-rect.left-20;
        crosshair.y = e.clientY-rect.top-17;
    };

    //Move bullets
    if(bulletActive){
        let bullet1Turn = ((Math.random())*3) * Math.PI/180;
        let bullet2Turn = 0;
        let bullet3Turn = ((Math.random()-1)*3) * Math.PI/180;

        bullet1.x += bulletSpeed * Math.cos(bulletAngle+bullet1Turn);
        bullet1.y += bulletSpeed * Math.sin(bulletAngle+bullet1Turn);

        bullet2.x += bulletSpeed * Math.cos(bulletAngle+bullet2Turn);
        bullet2.y += bulletSpeed * Math.sin(bulletAngle+bullet2Turn);

        bullet3.x += bulletSpeed * Math.cos(bulletAngle+bullet3Turn);
        bullet3.y += bulletSpeed * Math.sin(bulletAngle+bullet3Turn);

        //Reload
        if(bullet1.x > 1280)
        {
            canShoot = true;
        }
        else if(bullet1.x < 0)
        {
            canShoot = true;
        }
        else if(bullet1.y < 0)
        {
            canShoot = true;
        }
        else if(bullet1.y > 720)
        {
            canShoot = true;
        }
    }

    //Kill Zombies
    for(let j = 0; j<bullets.length; j++)
    {
        for(let i = 0; i<zombies.length; i++)
        {
            if(bullets[j].x>zombies[i].x+27*imagesScale && bullets[j].x<zombies[i].x+(27+206)*imagesScale)
            {
                if(bullets[j].y>zombies[i].y+77*imagesScale && bullets[j].y<zombies[i].y+(77+197)*imagesScale)
                {
                    zombies.splice(i,1);
                    zombiesWaitTime.splice(i,1);
                    zombiesAnimationPosition.splice(i,1);
                    zombiesPlayerCollision.splice(i,1);

                    score+=1;
                    bullets[j].x = 9999;
                    bullets[j].y = 9999;
                }
            }
        }
    }

    //Collision detection
    for(let i = 0; i<zombies.length; i++)
    {
        if(zombies[i].x+27*imagesScale>(640-37)-player.width*imagesScale && zombies[i].x+(27)*imagesScale<(640+(256-37)*imagesScale)-player.width*imagesScale)
        {
            if(zombies[i].y+79*imagesScale>(360-38*imagesScale)-player.height*imagesScale-80 && zombies[i].y+(79)*imagesScale<(360+(150-38)*imagesScale)-player.height*imagesScale+50)
            {
                zombiesPlayerCollision[i] = false;
                zombieAttackAnimationFunction(i);
            }
            else{
                if(zombiesPlayerCollision[i] === false)
                {
                    zombiesAnimationPosition[i] = 0;
                }
                zombiesPlayerCollision[i] = true;

            }
        }
        else{
            if(zombiesPlayerCollision[i] === false)
            {
                zombiesAnimationPosition[i] = 0;
            }
            zombiesPlayerCollision[i] = true;
        }
    }

    //Move Zombies
    for(let i = 0; i<zombies.length; i++)
    {
        if(zombiesPlayerCollision[i])
        {
            zombies[i].angle = Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x) + Math.PI;
            zombies[i].x -= movementSpeed*5 * Math.cos(Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x));
            zombies[i].y -= movementSpeed*5 * Math.sin(Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x));
            zombieMovementAnimationFunction(i);
        }
    }

    //Update Game Objects
    grass1.update();
    grass2.update();
    grass3.update();
    grass4.update();
    grass5.update();
    grass6.update();
    grass7.update();
    grass8.update();
    grass9.update();
    player.update();
    bullet1.update();
    bullet2.update();
    bullet3.update();
    crosshair.update();

    for(let i = 0; i<zombies.length; i++)
    {
        zombies[i].update();
    }

    if(gameOver)
    {
        restartScreen.update();
        ctx.fillText("High Score: " + highscore.toString(), 640, 650);
    }

}

function endGame(){
    gameOver = true;
    if(highscore<score)
    {
        highscore = score;
    }
}

//Enable Movement Input
function handleMovementPress(event) {
    let key = event.keyCode;
    if (key === 87) {
        moveForward = true;
    }
    else if (key === 83) {
        moveBackwards = true;
    }

    if (key === 82){
        if(gameOver)
        {
            startGame();
        }
    }
}

//Disable Movement Input
function handleMovementRelease(event) {
    let key = event.keyCode;
    if (key === 87) {
        moveForward = false;
    }
    else if (key === 83) {
        moveBackwards = false;
    }
}

//Move Grass to the left
function moveLeft()
{
    grassArray[2].x -= 1280*3;
    grassArray[5].x -= 1280*3;
    grassArray[8].x -= 1280*3;
    grassArray = [grassArray[2],grassArray[0],grassArray[1],grassArray[5],grassArray[3],grassArray[4],grassArray[8],grassArray[6],grassArray[7]];
}

//Move Grass to the right
function moveRight()
{
    grassArray[0].x += 1280*3;
    grassArray[3].x += 1280*3;
    grassArray[6].x += 1280*3;
    grassArray = [grassArray[1],grassArray[2],grassArray[0],grassArray[4],grassArray[5],grassArray[3],grassArray[7],grassArray[8],grassArray[6]];
}

//Move Grass up
function moveUp()
{
    grassArray[6].y += 720*3;
    grassArray[7].y += 720*3;
    grassArray[8].y += 720*3;
    grassArray = [grassArray[6],grassArray[7],grassArray[8],grassArray[0],grassArray[1],grassArray[2],grassArray[3],grassArray[4],grassArray[5]];
}

//Move Grass to the down
function moveDown()
{
    grassArray[0].y -= 720*3;
    grassArray[1].y -= 720*3;
    grassArray[2].y -= 720*3;
    grassArray = [grassArray[3],grassArray[4],grassArray[5],grassArray[6],grassArray[7],grassArray[8],grassArray[0],grassArray[1],grassArray[2]];
}

function Shoot(event)
{
    if(event.button === 0)
    {
        if(canShoot && !gameOver)
        {
            shootAnimationOver = false;
            bulletActive = true;
            bullet1.x = 640;
            bullet1.y = 360;
            bullet1.angle = player.angle;

            bullet2.x = 640;
            bullet2.y = 360;
            bullet2.angle = player.angle;

            bullet3.x = 640;
            bullet3.y = 360;
            bullet3.angle = player.angle;

            bulletAngle = player.angle;
            canShoot = false;
        }
    }
}

function spawnZombie()
{
    let newZombie = new Component(288*imagesScale, 311*imagesScale, zombieSprite,640-(288*imagesScale)/2,360-(311*imagesScale)/2,"image");

    let randomPosition = Math.floor(Math.random()*4)+1;

    if(randomPosition === 1)
    {
        newZombie.x = 0-(288*imagesScale)/2;
        newZombie.y = Math.random()*720-(311*imagesScale)/2;
    }
    else if(randomPosition === 2)
    {
        newZombie.x = 1280-(288*imagesScale)/2;
        newZombie.y = Math.random()*720-(311*imagesScale)/2;
    }
    else if(randomPosition === 3)
    {
        newZombie.x = Math.random()*1280-(288*imagesScale)/2;
        newZombie.y = 720-(311*imagesScale)/2;
    }
    else if(randomPosition === 4)
    {
        newZombie.x = Math.random()*1280-(288*imagesScale)/2;
        newZombie.y = 0-(311*imagesScale)/2;
    }

    zombies.push(newZombie);
    zombiesWaitTime.push(5);
    zombiesAnimationPosition.push(0);
    zombiesPlayerCollision.push(true);
}

let difficulty = 0.05;
let maxTime = 5000;
let minTime = 100;

function getRandomInterval() {
    // Random interval between 2 to 3 seconds
    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
    maxTime -= maxTime*difficulty;
    minTime -= minTime*difficulty;
}

//Animation variables
let i = 0;
let r = 0;
let waitTime = 10;

function playerMovementAnimationFunction()
{
    if(waitTime === 0)
    {
        playerSprite = playerMovementAnimation[i % playerMovementAnimation.length].src;
        i = (i + 1) % playerMovementAnimation.length;

        waitTime=10;
    }
    else{
        waitTime--;
    }
}

function playerShootAnimationFunction()
{
    if(waitTime === 0)
    {
        playerSprite = playerShootAnimation[i % playerShootAnimation.length].src;
        i = (i + 1) % playerShootAnimation.length;
        waitTime=20;

        if(playerSprite === playerShootAnimation[2].src)
        {
            shootAnimationOver = true;
            console.log("done");
        }
    }
    else{
        waitTime--;
    }
}

function playerIdleAnimationFunction()
{
    if(waitTime === 0)
    {
        playerSprite = playerIdleAnimation[i % playerIdleAnimation.length].src;
        i = (i + 1) % playerIdleAnimation.length;
        waitTime=30;
    }
    else{
        waitTime--;
    }
}

function zombieMovementAnimationFunction(zombieNum)
{
    if(zombiesWaitTime[zombieNum] === 0)
    {
        zombies[zombieNum].image.src = zombieMovementAnimation[zombiesAnimationPosition[zombieNum] % zombieMovementAnimation.length].src;
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieMovementAnimation.length;
        zombiesWaitTime[zombieNum]=5;
    }
    else{
        zombiesWaitTime[zombieNum]--;
    }
}

function zombieAttackAnimationFunction(zombieNum)
{
    if(zombiesWaitTime[zombieNum] === 0)
    {
        zombies[zombieNum].image.src = zombieAttackAnimation[zombiesAnimationPosition[zombieNum] % zombieAttackAnimation.length].src;
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieAttackAnimation.length;
        zombiesWaitTime[zombieNum]=5;

        if(zombies[zombieNum].image.src === zombieAttackAnimation[6].src)
        {
            if(zombiesPlayerCollision[zombieNum] === false)
            {
                endGame();
            }
        }
    }
    else{
        zombiesWaitTime[zombieNum]--;
    }
}