# Platform Adventure Game

Platform Adventure is a 2D side-scrolling platform game built with p5.js. In this game, you navigate through dynamic levels filled with challenging obstacles, collectable items, and a variety of enemies. Advance through each level by reaching the flagpole while avoiding hazards and defeating foes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Gameplay](#gameplay)
- [Controls](#controls)
- [Code Structure](#code-structure)
- [Assets](#assets)
- [Credits](#credits)
- [License](#license)

## Features

- **Multiple Levels:** Each level comes with its own configuration for flagpole position, number of collectables, and enemy count.
- **Dynamic Environment:** Randomly generated clouds, mountains, trees, platforms, and canyons create a varied landscape.
- **Enemy Encounters:** Battle different enemy types (slime, snail, fly) that patrol and interact with the environment.
- **Collectables:** Gather coins and other items to increase your score.
- **Game States:** Includes title screen, gameplay, pause, game over, and level complete screens.
- **Smooth Camera and Physics:** Enjoy smooth camera transitions, realistic gravity, and responsive jump mechanics.
- **Sound Effects & Music:** Background music and sound effects enhance the gaming experience.

## Gameplay

- Navigate through each level by controlling your character to overcome obstacles, avoid canyons, and defeat enemies.
- Collect items to boost your score.
- Reach the flagpole at the end of the level to complete it and move on to the next challenge.
- The game features different states including a title screen, a paused state, and screens for game over and level completion.

## Controls

- **Title Screen:**
  - Press `SPACE` to start the game.
- **During Gameplay:**
  - `LEFT ARROW`: Move left.
  - `RIGHT ARROW`: Move right.
  - `UP ARROW`: Jump.
  - `ESC`: Pause the game.
- **Game Over Screen:**
  - Press `R` to restart the level.
- **Level Complete Screen:**
  - Press `N` to proceed to the next level (if available).

## Code Structure

- **`sketch.js`**  
  This is the main file containing all game logic, including:
  - **Game State Management:** Uses a `GAME_STATES` object to manage different screens (title, playing, game over, level complete, and paused).
  - **Level Configuration:** Levels are configured via the `LEVEL_CONFIG` array, which defines the flagpole position, number of collectables, and enemy count.
  - **Asset Loading:** The `preload()` function loads all images and sounds.
  - **Game Loop:** The `draw()` function updates the game based on the current state.
  - **Physics & Collision:** Implements gravity, jump mechanics, collision detection with collectables, enemies, and platforms.
  - **Enemy Behavior:** An `Enemy` class manages enemy movement, animations, and interactions.

## Assets

- **Images:** Includes ground textures, enemy sprites (for slime, snail, and fly), and environmental elements such as clouds, mountains, and trees.
- **Sounds:** Background music, jump, collect, game over, and death sound effects are loaded from the `assets/sounds/` directory.
- **Note:** Ensure that the assets are in the correct directories as referenced in `sketch.js`.

## Credits

- Developed using [p5.js](https://p5js.org/).
- The heart drawing in the HUD was inspired by a sketch from [pattvira](https://editor.p5js.org/pattvira/sketches/1tV2BgiMG).
- Thank you to [Pixabay Sound Effects](https://pixabay.com/sound-effects/search/game/) for providing the game sounds.
- Graphics provided by **Platformer Art Complete Pack** by [Kenney Vleugels](https://www.kenney.nl)
