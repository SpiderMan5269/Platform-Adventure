// =======================
// GAME STATE MANAGEMENT
// =======================

const GAME_STATES = {
  TITLE: 0,
  PLAYING: 1,
  GAME_OVER: 2,
  LEVEL_COMPLETE: 3,
  PAUSED: 4,
};

let gameState = GAME_STATES.TITLE;
let currentLevel = 0;
const LEVEL_CONFIG = [
  {
    // Level 1 configuration
    flagpoleX: 4000,
    collectables: 4,
    enemies: 5,
  },
  {
    // Level 2 configuration
    flagpoleX: 8000,
    collectables: 5,
    enemies: 7,
  },
];

// =======================
// GAME STATE VARIABLE
// =======================

let floorPos_y;
let clouds = [],
  mountains = [],
  trees = [],
  canyons = [],
  collectables = [],
  platforms = [],
  enemies = [];
let isPlummeting = false;
let gameChar_x,
  gameChar_y,
  isJumping,
  isMovingLeft,
  isMovingRight,
  velocity,
  gravity,
  jumpStrength;
let cameraPosX = 0,
  cameraEasing = 0.05,
  cameraOffsetX = 0;
let levelLeftBound = 0;
let levelRightBound;
let lives = 3,
  gameScore = 0;
let flagpole = { x_pos: 0, isReached: false };
let bgMusic,
  jumpSound,
  collectSound,
  fallSound,
  gameStartSound,
  gameOverSound,
  levelCompleteSound;

// =======================
// ASSET LOADING & SETUP
// =======================

function preload() {
  soundFormats("mp3", "wav");
  bgMusic = loadSound("assets/sounds/game-music-loop-6-144641.mp3");
  gameStartSound = loadSound("assets/sounds/game-start-6104.mp3");
  jumpSound = loadSound("assets/sounds/cartoon-jump-6462.mp3");
  collectSound = loadSound("assets/sounds/game-bonus-2-294436.mp3");
  gameOverSound = loadSound("assets/sounds/game-over-arcade-6435.mp3");
  deathSound = loadSound("assets/sounds/male-death-sound-128357.mp3");

  // Slime
  slimeWalkSprite = loadImage("assets/images/enemies/slimeWalk1.png");
  slimeWalkSprite2 = loadImage("assets/images/enemies/slimeWalk2.png");
  slimeDeathSprite = loadImage("assets/images/enemies/slimeDead.png");

  // Snail
  snailWalk1 = loadImage("assets/images/enemies/snailWalk1.png");
  snailWalk2 = loadImage("assets/images/enemies/snailWalk2.png");
  snailDead = loadImage("assets/images/enemies/snailShell.png");

  // Fly
  flyFly1 = loadImage("assets/images/enemies/flyFly1.png");
  flyFly2 = loadImage("assets/images/enemies/flyFly2.png");
  flyDead = loadImage("assets/images/enemies/flyDead.png");

  // Ground textures
  grassTopImg = loadImage("assets/images/ground/grassMid.png");
  groundCenterImg = loadImage("assets/images/ground/grassCenter.png");

  // Platform textures
  grassHalfLeft = loadImage("assets/images/ground/grassHalfLeft.png");
  grassHalfRight = loadImage("assets/images/ground/grassHalfRight.png");
  grassHalfMid = loadImage("assets/images/ground/grassHalfMid.png");
}

function setup() {
  createCanvas(1024, 576);
  initializeLevel(currentLevel);
}

// =======================
// CORE GAME FUNCTIONS
// =======================

function startGame() {
  gameChar_x = width / 4;
  gameChar_y = floorPos_y;
  velocity = 0;
  gravity = 0.5;
  jumpStrength = -12;
  resetMovementStates();
  clearGameObjects();
  initializeObjects(width);

  if (!bgMusic.isPlaying()) {
    bgMusic.loop();
    bgMusic.setVolume(0.5);
  }
}

function resetMovementStates() {
  cameraOffsetX = 0;
  isJumping = isMovingLeft = isMovingRight = isPlummeting = false;
}

function clearGameObjects() {
  clouds = [];
  mountains = [];
  trees = [];
  canyons = [];
  collectables = [];
  enemies = [];
  platforms = [];
}

// =======================
// DRAW CYCLE
// =======================

function draw() {
  switch (gameState) {
    case GAME_STATES.TITLE:
      drawTitleScreen();
      break;

    case GAME_STATES.PLAYING:
      updatePlayingState();
      break;

    case GAME_STATES.GAME_OVER:
      drawGameOverScreen();
      break;

    case GAME_STATES.LEVEL_COMPLETE:
      drawLevelCompleteScreen();
      break;

    case GAME_STATES.PAUSED:
      drawPausedScreen();
      break;
  }
}

// =========================
// STATE-SPECIFIC FUNCTIONS
// =========================

function initializeLevel(levelIndex) {
  // Reset all game state while preserving level configuration
  currentLevel = levelIndex;
  const config = LEVEL_CONFIG[levelIndex];

  // Reset game state
  flagpole = {
    x_pos: config.flagpoleX,
    isReached: false,
  };
  floorPos_y = (height * 3) / 4;
  lives = 3;
  gameScore = 0;

  // Initialize objects
  clouds = [];
  mountains = [];
  trees = [];
  canyons = [];
  collectables = [];
  enemies = [];
  levelRightBound = width * 2;

  if (!bgMusic.isPlaying()) {
    bgMusic.loop();
  }

  startGame();
}

function drawEnvironment() {
  // Draw environment objects
  for (let mountain of mountains) {
    drawMountain(
      mountain.x,
      mountain.y,
      mountain.x + 150,
      mountain.y - 282,
      mountain.x + 300,
      mountain.y
    );
  }
  for (let cloud of clouds) {
    drawCloud(cloud.x, cloud.y);
  }
  for (let tree of trees) {
    drawTree(tree.x, tree.y);
  }
  for (let platform of platforms) {
    drawPlatform(platform.x, platform.y, platform.width, platform.height);
  }
  for (let canyon of canyons) {
    drawCanyon(canyon.x, canyon.y, canyon.width, canyon.height);
  }
  for (let collectable of collectables) {
    drawCollectable(
      collectable.x,
      collectable.y,
      collectable.scale,
      collectable.isFound
    );
  }
  for (let enemy of enemies) {
    enemy.draw();
  }
}

function updatePlayingState() {
  background(90, 20, 70);
  let color1 = color(98, 207, 244);
  let color2 = color(44, 103, 242);
  let color3 = color(115, 110, 254);
  noStroke();

  // Draw gradient layers
  setGradient(0, 0, width, height / 2, color1, color2, "Y");
  setGradient(0, height / 2, width, height / 2, color2, color3, "Y");

  updateCamera();
  updateWidth();
  drawGround(0, floorPos_y);

  push();
  translate(-cameraPosX, 0);
  drawEnvironment();
  drawFlagpole();
  drawCharacter(gameChar_x, gameChar_y, isMovingLeft, isMovingRight, isJumping);
  pop();

  updateCloudPos();

  // Game logic
  if (!isPlummeting) {
    if (isMovingLeft && gameChar_x > 20) {
      gameChar_x -= 5;
    }
    if (isMovingRight) {
      gameChar_x += 5;
    }
  }

  enemies.forEach((enemy) => {
    enemy.update();
    checkEnemyCollision(enemy);
    enemies = enemies.filter((e) => e.state !== "dead");
    enemies.forEach((e) => e.update());
  });

  applyGravity();
  checkCanyonFall();
  checkCollectable();
  checkPlatforms();

  // UI Elements
  drawHUD();

  // State checks
  if (!flagpole.isReached) checkFlagpole();
  checkPlayerDie();
}

// =======================
// STATE SCREENS
// =======================

function drawTitleScreen() {
  background(0);
  fill(255);
  textSize(60);
  textAlign(CENTER);
  text("Platform Adventure", width / 2, height / 2);
  textSize(30);
  text("Press SPACE to Start", width / 2, height / 2 + 60);
  text("Use Arrow keys to Play", width / 2, height / 2 + 100);
}

function drawPausedScreen() {
  background(0, 150);
  fill(255);
  textSize(60);
  textAlign(CENTER);
  text("Game Paused", width / 2, height / 2);
  textSize(30);
  text("Press ESC to Resume", width / 2, height / 2 + 60);
}

function drawGameOverScreen() {
  background(0, 50);
  fill(255, 0, 0);
  textSize(60);
  textAlign(CENTER);
  text("Game Over", width / 2, height / 2);
  fill(255);
  textSize(30);
  text("Press R to Restart", width / 2, height / 2 + 60);

  if (bgMusic.isPlaying()) {
    bgMusic.stop(); // Stop music on game over
  }
}

function drawLevelCompleteScreen() {
  background(0, 100);
  fill(0, 255, 0);
  textSize(60);
  textAlign(CENTER);
  text("Level Complete!", width / 2, height / 2);
  fill(255);
  textSize(30);

  if (currentLevel < LEVEL_CONFIG.length - 1) {
    text("Press N for Next Level", width / 2, height / 2 + 60);
  } else {
    text("You Win! Final Score: " + gameScore, width / 2, height / 2 + 60);
  }
}

// =======================
// UPDATING VALUE CODES
// =======================

function updateCloudPos() {
  // Animate clouds with parallax movement and reset offscreen clouds
  for (var i = 0; i < clouds.length; i++) {
    clouds[i].x += clouds[i].speed; // Move cloud to the right

    // If cloud goes off the screen, reset its position to the left
    if (clouds[i].x > levelRightBound + 100) {
      clouds[i].x = levelRightBound - 1124; // Reset to the left side
    }
  }
}

function updateCamera() {
  // Calculate camera boundaries based on level size
  const leftThreshold = width * 0.25;
  const rightThreshold = width * 0.75;
  const maxCameraX = levelRightBound - width;

  // Calculate desired camera offset based on character position
  let targetOffset = constrain(
    gameChar_x - width * 0.25, // Keep character at 1/4 screen position
    0,
    maxCameraX
  );

  if (gameChar_x - cameraOffsetX > rightThreshold) {
    targetOffset = gameChar_x - rightThreshold;
  } else if (gameChar_x - cameraOffsetX < leftThreshold) {
    targetOffset = gameChar_x - leftThreshold;
  }

  // Clamp camera to level boundaries
  targetOffset = constrain(targetOffset, levelLeftBound, maxCameraX);

  // Smoothly interpolate camera position using easing factor (0.05 = 5% per frame)
  cameraOffsetX += (targetOffset - cameraOffsetX) * cameraEasing;

  // Update camera position for drawing
  cameraPosX = cameraOffsetX;
}

function updateWidth() {
  const sectionSize = 1024;
  const rightEdge = gameChar_x + width / 2;

  // Add flagpole boundary check
  if (levelRightBound < flagpole.x_pos + 500) {
    if (rightEdge > levelRightBound - 500) {
      levelRightBound = Math.min(
        levelRightBound + sectionSize,
        flagpole.x_pos + 1000
      );
      initializeObjects(levelRightBound);
    }
  }
}

// =======================
// KEYS CLICKED CODES
// =======================

function handleGameplayInput() {
  if (isPlummeting == false && !flagpole.isReached && lives > 0) {
    if (keyCode == 37) {
      isMovingLeft = true;
    } else if (keyCode == 39) {
      isMovingRight = true;
    }

    if (keyCode == 38) {
      isJumping = true;
    }
  }
}

function keyPressed() {
  switch (gameState) {
    case GAME_STATES.TITLE:
      if (key === " ") {
        gameState = GAME_STATES.PLAYING;
        gameStartSound.play();
      }
      break;

    case GAME_STATES.PLAYING:
      if (keyCode === 27) {
        gameState = GAME_STATES.PAUSED;
      } else {
        handleGameplayInput();
      }
      break;

    case GAME_STATES.GAME_OVER:
      if (key === "r" || key === "R") {
        initializeLevel(currentLevel);
        gameState = GAME_STATES.PLAYING;
      }
      break;

    case GAME_STATES.LEVEL_COMPLETE:
      if (key === "n" || key === "N") {
        if (currentLevel < LEVEL_CONFIG.length - 1) {
          currentLevel++;
          initializeLevel(currentLevel);
          gameState = GAME_STATES.PLAYING;
        }
      }
      break;

    case GAME_STATES.PAUSED:
      if (keyCode === 27) {
        gameState = GAME_STATES.PLAYING;
      }
      break;
  }
}

function keyReleased() {
  if (keyCode == 37) {
    isMovingLeft = false;
  } else if (keyCode == 39) {
    isMovingRight = false;
  }

  if (keyCode == 38) {
    isJumping = false;
  }
}

// =======================
// STATE CHECKING CODES
// =======================

function applyGravity() {
  // Check if the character is on the ground or a platform
  let isOnGround = gameChar_y === floorPos_y;
  let isOnPlatform = platforms.some((platform) => gameChar_y === platform.y);

  // Trigger jump only once per press
  if ((isOnGround || isOnPlatform) && isJumping && !hasJumped) {
    velocity = jumpStrength;
    hasJumped = true; // Prevent further jumps until landing
    jumpSound.play();
    jumpSound.setVolume(0.3);
  }

  // Variable jump height
  if (!isJumping && velocity < 0) {
    velocity += gravity * 1.5;
  }

  // Apply gravity
  velocity += gravity;
  gameChar_y += velocity;

  // Reset when landing on ground
  if (gameChar_y > floorPos_y && !isPlummeting) {
    gameChar_y = floorPos_y;
    velocity = 0;
    isJumping = false;
    hasJumped = false; // Reset flag here
  }
}

function checkPlayerDie() {
  if (gameChar_y > height) {
    deathSound.play();
    deathSound.setVolume(0.3);
    lives--;
    if (lives > 0) {
      cameraOffsetX = 0; // Reset camera
      startGame();
    } else {
      gameOverSound.play();
      gameState = GAME_STATES.GAME_OVER;
    }
  }
}

function checkFlagpole() {
  // Check X collision with flagpole width (5px) and any Y position
  if (
    gameChar_x >= flagpole.x_pos - 10 &&
    gameChar_x <= flagpole.x_pos + 15 &&
    !flagpole.isReached
  ) {
    flagpole.isReached = true;
    gameState = GAME_STATES.LEVEL_COMPLETE;
  }
}

function checkCanyonFall() {
  for (let canyon of canyons) {
    if (
      gameChar_x >= canyon.x + 15 &&
      gameChar_x <= canyon.x + canyon.width - 15 && // Detect when character center is over canyon opening (15px buffer from edges)
      gameChar_y == floorPos_y
    ) {
      isPlummeting = true;
      velocity = 0;
    }
  }

  if (isPlummeting) {
    velocity += gravity;
    isMovingLeft = isMovingRight = isJumping = false;
  }
}

function checkCollectable() {
  for (var i = 0; i < collectables.length; i++) {
    var item = collectables[i];
    if (item.isFound) continue;
    var charSizeX = 20;
    var charSizeY = 40;
    var itemSize = 15;
    var hitX =
      gameChar_x + charSizeX / 2 > item.x - itemSize &&
      gameChar_x - charSizeX / 2 < item.x + itemSize;
    var hitY =
      gameChar_y + charSizeY / 2 > item.y - itemSize &&
      gameChar_y - charSizeY / 2 < item.y + itemSize;
    if (hitX && hitY) {
      item.isFound = true;
      gameScore++;
      collectSound.play();
      collectSound.setVolume(0.3);
    }
  }
}

function checkPlatforms() {
  for (let platform of platforms) {
    const isOnPlatform =
      gameChar_y >= platform.y - 5 && gameChar_y <= platform.y + 5;

    if (
      gameChar_x > platform.x &&
      gameChar_x < platform.x + platform.width &&
      isOnPlatform &&
      velocity > 0
    ) {
      velocity = 0;
      gameChar_y = platform.y;
      hasJumped = false; // Reset flag when landing on a platform
    }
  }
}

function checkEnemyCollision(enemy) {
  if (enemy.state !== "alive") return;

  // Player collision box
  const pLeft = gameChar_x - 10;
  const pRight = gameChar_x + 10;
  const pTop = gameChar_y - 40;
  const pBottom = gameChar_y;

  // Enemy collision box
  const eLeft = enemy.x - enemy.w / 2;
  const eRight = enemy.x + enemy.w / 2;
  const eTop = enemy.y - enemy.h / 2;
  const eBottom = enemy.y + enemy.h / 2;

  // Collision detection
  if (pRight > eLeft && pLeft < eRight && pBottom > eTop && pTop < eBottom) {
    // Check if player is falling onto enemy
    if (pBottom < eTop + 30) {
      // Kill enemy
      enemy.state = "dying";
      enemy.animFrame = 0;
      velocity = jumpStrength * 0.8; // Small bounce
      gameScore += 10;
    } else {
      // Hurt player
      deathSound.play();
      deathSound.setVolume(0.3);
      lives--;
      if (lives > 0) {
        startGame();
      } else {
        gameOverSound.play();
        gameState = GAME_STATES.GAME_OVER;
      }
    }
  }
}

// ===============================================
// ALL DRAWING AND INITIALIZATION CODE BELOW HERE
// ===============================================

function initializeObjects(w) {
  const config = LEVEL_CONFIG[currentLevel];
  const minX = Math.max(w - 1014, 2084); // Start generating after 500px
  const maxX = Math.min(w - 10, flagpole.x_pos - 100); // Stop before flagpole
  const SAFETY_ZONE = 500;

  var mountainCount = int(random(2, 8));
  for (var i = 0; i < mountainCount; i++) {
    var mountain = {
      x: random(minX, maxX),
      y: floorPos_y,
    };
    for (var j = 0; j < mountains.length; j++) {
      while (
        dist(mountain.x, mountain.y, mountains[j].x, mountains[j].y) < 150
      ) {
        mountain.x = random(w - 1014, w - 10);
      }
    }
    mountains.push(mountain);
  }

  var cloudCount = int(random(2, 6));
  for (var i = 0; i < cloudCount; i++) {
    var cloud = {
      x: random(Math.max(w - 1224, 500), maxX),
      y: random(50, 150),
      speed: random(0.5, 2),
      scale: random(0.7, 1.2),
    };
    // Ensure no overlap with existing clouds
    for (var j = 0; j < clouds.length; j++) {
      while (dist(cloud.x, cloud.y, clouds[j].x, clouds[j].y) < 150) {
        cloud.x = random(w - 1224, w);
      }
    }
    clouds.push(cloud);
  }

  var platformCount = int(random(2, 4));
  for (var i = 0; i < platformCount; i++) {
    let validPlatform = false;
    let attempts = 0;

    while (!validPlatform && attempts < 50) {
      var platform = {
        x: random(w - 1014, w - 10),
        y: floorPos_y - random(80, 120),
        width: floor(random(1, 3)) * 32 + 64,
      };

      for (var j = 0; j < platforms.length; j++) {
        while (
          dist(platform.x, platform.y, platforms[j].x, platforms[j].y) <
          platform.width + 50
        ) {
          platform.x += 5;
          platform.y -= 1;
        }
      }

      validPlatform = platform.y > 75;
      if (!validPlatform) platform.y += 10;

      attempts++;
    }

    if (validPlatform) platforms.push(platform);
  }

  var canyonCount = int(random(1, 4));
  for (var i = 0; i < canyonCount; i++) {
    let validCanyon = false;
    let attempts = 0;

    while (!validCanyon && attempts < 50) {
      var canyon = {
        x: random(Math.max(w - 1014, SAFETY_ZONE), w - 10),
        y: floorPos_y,
        width: random(100, 150),
        height: height - floorPos_y,
      };

      for (var j = 0; j < canyons.length; j++) {
        while (
          dist(canyon.x, canyon.y, canyons[j].x, canyons[j].y) <
          canyon.width + 50
        ) {
          canyon.x += 100;
        }
      }

      const flagpoleBuffer = 500;
      validCanyon =
        canyon.x >= SAFETY_ZONE &&
        !(
          canyon.x < flagpole.x_pos + flagpoleBuffer &&
          canyon.x + canyon.width > flagpole.x_pos - flagpoleBuffer
        );
      attempts++;
      }

    if (validCanyon) canyons.push(canyon);
  }

  var treeCount = int(random(2, 5));
  for (var i = 0; i < treeCount; i++) {
    var tree = {
      x: random(minX, maxX),
      y: floorPos_y,
    };
    for (var j = 0; j < trees.length; j++) {
      while (dist(tree.x, tree.y, trees[j].x, trees[j].y) < 100) {
        tree.x = random(w - 1014, w - 10);
      }
    }
    for (var j = 0; j < canyons.length; j++) {
      while (dist(tree.x, tree.y, canyons[j].x, canyons[j].y) < 100) {
        tree.x = random(w - 1014, w - 10);
      }
    }
    trees.push(tree);
  }

  for (var i = 0; i < config.collectables; i++) {
    let spawnOnPlatform = random() < 0.4; // 40% chance to spawn on platform
    let collectableY = floorPos_y - 22;
    let validPosition = false;
    let attempts = 0;

    while (!validPosition && attempts < 100) {
      let newX = random(w - 1014, w - 10);
      validPosition = true;

      if (spawnOnPlatform && platforms.length > 0) {
        let platform = random(platforms);
        collectableY = platform.y - 30;
        newX = platform.x + platform.width / 2;
      }

      for (let canyon of canyons) {
        if (newX >= canyon.x && newX <= canyon.x + canyon.width) {
          validPosition = false;
          break;
        }
      }

      for (let existing of collectables) {
        if (dist(newX, collectableY, existing.x, existing.y) < 50) {
          validPosition = false;
          break;
        }
      }

      if (validPosition) {
        collectables.push({
          x: newX,
          y: collectableY,
          scale: 1,
          isFound: false,
        });
        break;
      }

      if (!validPosition && attempts >= 50) {
        spawnOnPlatform = false;
        collectableY = floorPos_y - 22;
      }

      attempts++;
    }
  }

  for (let i = 0; i < LEVEL_CONFIG[currentLevel].enemies; i++) {
    let validPosition = false;
    let attempts = 0;
    let newEnemy;

    while (!validPosition && attempts < 100) {
      const types = [
        "slime",
        "slime",
        "slime",
        "slime",
        "slime",
        "slime",
        "snail",
        "snail",
        "snail",
        "fly",
      ];
      const type = random(types);
      const xPos = random(Math.max(SAFETY_ZONE, w - 1014), w - 200);
      const yPos = type === "fly" ? floorPos_y - 200 : floorPos_y;

      newEnemy = new Enemy(xPos, yPos, type);

      validPosition =
        enemies.every((e) => abs(e.x - newEnemy.x) > 150) &&
        canyons.every(
          (c) => newEnemy.x < c.x - 100 || newEnemy.x > c.x + c.width + 100
        ) &&
        (type === "fly" ||
          platforms.some((p) => abs(newEnemy.x - p.x) < p.width / 2));

      attempts++;
    }

    if (validPosition) enemies.push(newEnemy);
  }
}

function drawGround(x, y) {
  const tileSize = 32;
  const groundY = floorPos_y;

  // Draw center ground layer
  let centerTiles = ceil(width / tileSize) + 2;
  let verticalTiles = ceil((height - groundY) / tileSize);
  for (let i = 0; i < centerTiles; i++) {
    for (let j = 0; j < verticalTiles; j++) {
      image(
        groundCenterImg,
        x + i * tileSize - (cameraPosX % tileSize),
        groundY + j * tileSize,
        tileSize,
        tileSize
      );
    }
  }

  // Draw grass top layer
  let topTiles = ceil(width / tileSize) + 2;
  for (let i = 0; i < topTiles; i++) {
    image(
      grassTopImg,
      x + i * tileSize - (cameraPosX % tileSize),
      groundY, // Align with character's feet position
      tileSize,
      tileSize
    );
  }
}

function drawCloud(x, y) {
  fill(255);
  ellipse(x, y, 100, 70); // Main body
  ellipse(x + 40, y - 20, 120, 80); // Top right puff
  ellipse(x + 80, y, 100, 70); // Right puff
  ellipse(x + 40, y + 20, 120, 80); // Bottom right puff
  ellipse(x - 40, y, 100, 70); // Left puff
  ellipse(x - 20, y - 20, 80, 60); // Top left puff

  noStroke();
}

function drawMountain(x1, y1, x2, y2, x3, y3) {
  fill(120, 42, 42, 240);
  triangle(x1, y1, x2, y2, x3, y3);

  noStroke();
}

function drawTree(x, y) {
  // Draw the tree trunk
  fill(139, 69, 19); // Brown color for the trunk
  noStroke();
  rect(x, y, 50, -100);

  // Draw the main foliage of the tree with rounded edges
  fill(34, 139, 34); // Dark green for the tree leaves
  beginShape();
  curveVertex(x + 25, y - 160); // Top point of the foliage
  curveVertex(x - 60, y - 60); // Left point of the foliage
  curveVertex(x + 110, y - 60); // Right point of the foliage
  curveVertex(x + 25, y - 160);
  endShape(CLOSE); // Main foliage with rounded edges

  // Draw a second layer of leaves for added fullness (also with rounded edges)
  fill(50, 205, 50); // Lighter green for the second layer
  beginShape();
  curveVertex(x + 25, y - 200); // Top point of the second layer
  curveVertex(x - 50, y - 95); // Left point of second layer
  curveVertex(x + 100, y - 95); // Right point of second layer
  curveVertex(x + 25, y - 200);
  endShape(CLOSE); // Second layer foliage with rounded edges

  noStroke();
}

function drawPlatform(x, y, width) {
  const tileSize = 32;

  image(grassHalfLeft, x, y, tileSize, tileSize);

  image(grassHalfRight, x + width - tileSize, y, tileSize, tileSize);

  const middleWidth = width - 2 * tileSize;
  const middleTiles = Math.max(1, middleWidth / tileSize);

  for (let i = 0; i < middleTiles; i++) {
    image(grassHalfMid, x + tileSize + i * tileSize, y, tileSize, tileSize);
  }
}

function drawCanyon(x, y, width, height) {
  fill(78, 53, 36);
  rect(x, y, width, height);
  fill(128, 190, 31);
  rect(x, y, 10, height, 0, 10, 10, 0);
  rect(x + width - 10, y, 10, height, 10, 0, 0, 10);
  noStroke();
}

function drawCollectable(x, y, scale, isFound) {
  if (isFound) return;

  // Animation parameters
  const floatOffset = sin(frameCount * 0.1) * 3 * scale;
  const rotationAngle = frameCount * 0.05;
  const pulse = 1 + sin(frameCount * 0.15) * 0.1;

  push();
  translate(x, y + floatOffset);
  rotate(rotationAngle);

  // Shadow with depth
  fill(50, 50, 50, 100);
  noStroke();
  ellipse(4 * scale, 2 * scale, 25 * scale, 30 * scale);

  // Glowing aura (fixed color values)
  for (let i = 0; i < 3; i++) {
    fill(color(255, min(215 + i * 20, 255), 0, 40 - i * 15));
    ellipse(0, 0, (28 + i * 3) * scale * pulse, (28 + i * 3) * scale * pulse);
  }

  // Main coin body with gradient effect using solid colors
  fill(255, 240, 180);
  stroke(255, 184, 0);
  strokeWeight(3 * scale);
  ellipse(0, 0, 25 * scale, 25 * scale);

  // Inner detail
  noFill();
  stroke(250, 155, 0);
  strokeWeight(2 * scale);
  ellipse(0, 0, 18 * scale, 18 * scale);

  // Specular highlight
  fill(255, 255, 255, 150);
  noStroke();
  ellipse(-5 * scale, -5 * scale, 6 * scale, 6 * scale);

  // Coin icon
  fill(255, 215, 0);
  textSize(12 * scale);
  textAlign(CENTER, CENTER);
  text("$", 0, 0);

  pop();
}

function drawHeart(i) {
  // Credits to https://editor.p5js.org/pattvira/sketches/1tV2BgiMG
  fill(255, 0, 0);
  beginShape();
  for (let j = 0; j < 360; j += 0.05) {
    let x = 16 * sin(j) * sin(j) * sin(j) + 30 + 40 * i;
    let y =
      -1 * (13 * cos(j) - 5 * cos(2 * j) - 2 * cos(3 * j) - cos(4 * j) - 50);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawFlagpole() {
  fill(220);
  rect(flagpole.x_pos, floorPos_y - 250, 5, 250);
  fill(flagpole.isReached ? "green" : "red");
  triangle(
    flagpole.x_pos + 5,
    floorPos_y - 250,
    flagpole.x_pos + 95,
    floorPos_y - 200,
    flagpole.x_pos + 5,
    floorPos_y - 180
  );
}

function drawCharacter(x, y, isMovingLeft, isMovingRight, isJumping) {
  // Legs
  let legLength = 4;
  fill(0);
  if (isMovingLeft) {
    rect(x + 0.5, y, 5, -18); // Right leg longer
    rect(x - 0.5, y - legLength, -5, -18); // Left leg shorter
  } else if (isMovingRight) {
    rect(x + 0.5, y - legLength, 5, -18); // Right leg longer
    rect(x - 0.5, y, -5, -18); // Left leg shorter
  } else {
    rect(x + 0.5, y, 5, -15); // Default Right leg
    rect(x - 0.5, y, -5, -15); // Default Left leg
  }

  if (isJumping) {
    if (isMovingLeft) {
      // Left arm in front and right arm backward while moving left
      push(); // Save the state for transformations
      translate(x, y); // Translate to character's position
      rotate(radians(-20)); // Rotate the arm 20 degrees for backward movement
      fill(190, 153, 123); // Darker color for the back arm (left)
      rect(8, -40, -5, -20, 10); // Left arm backward
      pop(); // Restore transformations

      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Eyes facing left
      fill(0);
      rect(x - 8, y - 44, 5, -7, 5); // Left eye
      rect(x, y - 44, 5, -7, 5); // Right eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);

      push(); // Save the state for the front arm
      translate(x, y); // Translate to character's position
      rotate(radians(20)); // Rotate the arm 20 degrees for forward movement
      fill(235, 183, 144); // Lighter color for the front arm
      rect(-8, -40, 5, -20, 10); // Right arm forward
      pop(); // Restore transformations
    } else if (isMovingRight) {
      // Right arm in front and left arm backward while moving right
      push(); // Save the state for transformations
      translate(x, y); // Translate to character's position
      rotate(radians(20)); // Rotate the arm 20 degrees for forward movement
      fill(190, 153, 123); // Darker color for the back arm (right)
      rect(-8, -40, 5, -20, 10); // Right arm backward
      pop(); // Restore transformations

      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Eyes facing right
      fill(0);
      rect(x + 4, y - 44, 5, -7, 5); // Right eye
      rect(x - 4, y - 44, 5, -7, 5); // Left eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);

      push(); // Save the state for the front arm
      translate(x, y); // Translate to character's position
      rotate(radians(-20)); // Rotate the arm -20 degrees for backward movement
      fill(235, 183, 144); // Lighter color for the front arm
      rect(8, -40, -5, -20, 10); // Left arm forward
      pop(); // Restore transformations
    } else {
      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Default eyes (facing forward)
      fill(0);
      rect(x + 2, y - 44, 5, -7, 5); // Right eye
      rect(x - 2, y - 44, -5, -7, 5); // Left eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);

      // Standing arms (default)
      fill(235, 183, 144);
      push(); // Save the state for transformations
      translate(x, y); // Translate to character's position
      rotate(radians(-25));
      rect(6, -35, 5, -20, 10); // Right arm
      pop();

      push();
      translate(x, y); // Translate to character's position
      rotate(radians(25));
      rect(-6, -35, -5, -20, 10); // Left arm
      pop();
    }
  } else {
    if (isMovingLeft) {
      // Left arm in front and right arm backward while moving left
      push(); // Save the state for transformations
      translate(x, y); // Translate to character's position
      rotate(radians(-20)); // Rotate the arm 20 degrees for backward movement
      fill(190, 153, 123); // Darker color for the back arm (left)
      rect(8, -40, -5, 20, 10); // Left arm backward
      pop(); // Restore transformations

      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Eyes facing left
      fill(0);
      rect(x - 8, y - 44, 5, -7, 5); // Left eye
      rect(x, y - 44, 5, -7, 5); // Right eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);

      push(); // Save the state for the front arm
      translate(x, y); // Translate to character's position
      rotate(radians(20)); // Rotate the arm 20 degrees for forward movement
      fill(235, 183, 144); // Lighter color for the front arm
      rect(-8, -40, 5, 20, 10); // Right arm forward
      pop(); // Restore transformations
    } else if (isMovingRight) {
      // Right arm in front and left arm backward while moving right
      push(); // Save the state for transformations
      translate(x, y); // Translate to character's position
      rotate(radians(20)); // Rotate the arm 20 degrees for forward movement
      fill(190, 153, 123); // Darker color for the back arm (right)
      rect(-8, -40, 5, 20, 10); // Right arm backward
      pop(); // Restore transformations

      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Eyes facing right
      fill(0);
      rect(x + 4, y - 44, 5, -7, 5); // Right eye
      rect(x - 4, y - 44, 5, -7, 5); // Left eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);

      push(); // Save the state for the front arm
      translate(x, y); // Translate to character's position
      rotate(radians(-20)); // Rotate the arm -20 degrees for backward movement
      fill(235, 183, 144); // Lighter color for the front arm
      rect(8, -40, -5, 20, 10); // Left arm forward
      pop(); // Restore transformations
    } else {
      // Standing arms (default)
      fill(235, 183, 144);
      rect(x + 8, y - 39, 5, 20, 10); // Right arm
      rect(x - 8, y - 39, -5, 20, 10); // Left arm

      // Torso
      fill(0, 155, 155);
      rect(x + 8, y - 15, -16, -25);

      // Head
      fill(255, 203, 164);
      ellipse(x, y - 48, 23, 22);

      // Default eyes (facing forward)
      fill(0);
      rect(x + 2, y - 44, 5, -7, 5); // Right eye
      rect(x - 2, y - 44, -5, -7, 5); // Left eye

      // Hat
      fill(0);
      beginShape();
      vertex(x + 20, y - 53);
      vertex(x + 10, y - 57);
      vertex(x, y - 68);
      vertex(x - 10, y - 57);
      vertex(x - 20, y - 53);
      endShape(CLOSE);
    }
  }
}

function drawHUD() {
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(`Score: ${gameScore} | Level: ${currentLevel + 1}`, 20, 30);

  // Draw hearts
  for (let i = 0; i < lives; i++) {
    drawHeart(i);
  }
}

// =======================
// GRADIENT BACKGROUND
// =======================

function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();
  if (axis == "Y") {
    // Vertical gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis == "X") {
    // Horizontal gradient
    for (let j = x; j <= x + w; j++) {
      let inter = map(j, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(j, y, j, y + h);
    }
  }
  noStroke();
}

// =======================
// ENEMY CLASS & CONFIG
// =======================

class Enemy {
  constructor(x, y, type = "slime") {
    this.type = type;

    // Position & Size
    this.x = x;
    this.y = y;

    // Type-specific adjustments
    switch (this.type) {
      case "slime":
        this.w = 64;
        this.h = 48;
        this.scale = 0.7;
        this.speed = 0.3;
        this.patrolDistance = 250;
        this.y = floorPos_y - this.h / 2;
        break;

      case "snail":
        this.w = 48;
        this.h = 32;
        this.scale = 0.8;
        this.speed = 0.2;
        this.patrolDistance = 150;
        this.y = floorPos_y - this.h / 2;
        break;

      case "fly":
        this.w = 34;
        this.h = 20;
        this.scale = 0.8;
        this.speed = random(0.4, 0.7);
        this.patrolDistance = 200;
        this.y = floorPos_y - 200; // Flying height
        this.floatOffset = 0;
        break;
    }

    // State Management
    this.state = "alive";
    this.direction = 1;
    this.startX = x;

    // Animation Control
    this.animFrame = 2;
    this.walkFrames = 4;
    this.deathFrames = 4;
    this.animSpeed = 0.05;
  }

  update() {
    if (this.state === "alive") {
      // Horizontal movement (world coordinates)
      this.x += this.speed * this.direction;

      // Patrol distance check
      if (Math.abs(this.x - this.startX) > this.patrolDistance) {
        this.direction *= -1;
      }

      // Platform/canyon detection
      if (!this.onPlatform()) {
        this.direction *= -1;
      }

      // Flying enemy float effect
      if (this.type === "fly") {
        this.floatOffset = sin(frameCount * 0.1) * 5;
      }

      // Walking animation
      this.animFrame = (this.animFrame + this.animSpeed) % this.walkFrames;
    } else if (this.state === "dying") {
      this.animFrame += this.animSpeed;
      if (this.animFrame >= this.deathFrames) this.state = "dead";
    }
  }

  draw() {
    if (this.state === "dead") return;

    if (this.state === "dying") {
      let deathSheet;
      switch (this.type) {
        case "slime":
          deathSheet = slimeDeathSprite;
          break;
        case "snail":
          deathSheet = snailDead;
          break;
        case "fly":
          deathSheet = flyDead;
          break;
      }
      this.drawDeathSprite(deathSheet);
      return;
    }

    let sheet, frameW, frameH;
    switch (this.type) {
      case "slime":
        sheet =
          Math.floor(this.animFrame) % 2 === 0
            ? slimeWalkSprite
            : slimeWalkSprite2;
        frameW = 64;
        frameH = 64;
        break;

      case "snail":
        sheet = Math.floor(this.animFrame) % 2 === 0 ? snailWalk1 : snailWalk2;
        frameW = 64;
        frameH = 64;
        break;

      case "fly":
        sheet = Math.floor(this.animFrame) % 2 === 0 ? flyFly1 : flyFly2;
        frameW = 70;
        frameH = 64;
        break;
    }

    push();
    // Draw in world coordinates (no camera offset)
    translate(
      this.x + (this.direction === -1 ? (this.w * this.scale) / 2 : 0),
      this.y + (this.type === "fly" ? this.floatOffset : 0)
    );
    // Flip sprite based on direction
    if (this.direction === -1) {
      scale(-1, 1);
    }

    image(
      sheet,
      (-this.w / 2) * this.scale,
      (-this.h / 2) * this.scale,
      this.w * this.scale,
      this.h * this.scale,
      0,
      0,
      frameW,
      frameH
    );
    pop();
  }

  drawDeathSprite(sheet) {
    push();
    translate(this.x, this.y);

    // Special case for snail shell
    if (this.type === "snail") {
      rotate(PI); // Flip upside down
      translate(-this.w * this.scale, -this.h * this.scale);
    }

    image(
      sheet,
      (-this.w * this.scale) / 2,
      (-this.h * this.scale) / 2,
      this.w * this.scale,
      this.h * this.scale
    );
    pop();
  }

  onPlatform() {
    // Canyon detection
    const nextX = this.x + this.direction * this.speed;
    for (const canyon of canyons) {
      if (nextX > canyon.x - 50 && nextX < canyon.x + canyon.width + 50) {
        return false;
      }
    }

    // Platform detection for ground enemies
    if (this.type !== "fly") {
      return (
        platforms.some(
          (p) =>
            nextX > p.x &&
            nextX < p.x + p.width &&
            this.y + this.h / 2 >= p.y &&
            this.y + this.h / 2 <= p.y + 5
        ) || this.y + this.h / 2 >= floorPos_y
      );
    }
    return true; // Flying enemies ignore platforms
  }
}
