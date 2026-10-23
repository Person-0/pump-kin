# **Pump-kin**

An infinite maze game where you're a pumpkin and need to avoid ghosts.

<img src="./repo_assets/img (1).png" width="512px">

## What is this?

This is a game where the player is a pumpkin roaming an endless maze. The maze is also filled with ghosts, which move randomly.<br>

The player needs to avoid the ghosts while exploring the maze.<br>

## How was this made?

- The AIM while making this game was to learn about infinite procedurally generated mazes, and not to actually create a good looking game (which is the reason the game looks so basic)
- I initially used the [Eller's algorithm](https://weblog.jamisbuck.org/2010/12/29/maze-generation-eller-s-algorithm) but that just didn't work so moved onto [Sidewinder algorithm](https://weblog.jamisbuck.org/2011/2/3/maze-generation-sidewinder-algorithm).

## Tools and tech used
- The game was made in Vanilla HTML/CSS and JS
- The dev environment uses [Vite](https://vite.dev/) with [TypeScript](https://www.typescriptlang.org/) to speed up the development and help with issues faced when using vanilla JS.
- All the game assets, textures were made by me using [pixilart.com](https://www.pixilart.com/)!! These are available in the [public/resources](./public/resources/) directory.

## How to play?

- Open the demo link (click here)
- Click the play button
- Use WASD keys to move around in the maze.
- You have 3 lives, avoid the ghosts. Every collision into a ghost costs one life and makes you invincible for 2.5s so you can reposition yourself.
- If you use up all your lives you are greeted with a game over page with a replay button. You can press the replay button to replay the game!

## Further Updates?
I plan on adding the following stuff later on:
- a timer on the top right to show the time spent
- collectible items that restore health or provide powerups
- different types of ghosts
- an actual goal of the game instead of just roaming around freely

## Development
Follow these steps to setup the development environment on your computer and build the game from source:
- Install [NodeJS](https://nodejs.org/) (I'm on v24.13.0) if you haven't already.
- Ensure you have `npm` or [`pnpm`](https://pnpm.io/) installed, I prefer [`pnpm`](https://pnpm.io/) since it reduces the `node_modules` folder size by a lot.
- Clone this repository (using `git clone`) or download zip file and extract it.
- Open terminal with the current directory as the root directory of this repository.
- Install dependencies with either npm or pnpm:
    - npm:
    - ```
        npm i 
      ```
    - pnpm:
    - ```
        pnpm i 
      ```
- Host the game locally:
    - ```
        npm run dev
      ```
- Build the game:
    - ```
        npm run build
      ```
    - This creates a dist folder with the index.html and other required files that can be hosted anywhere!

## Demo Screnshots

<img src="./repo_assets/img (3).png" width="512px">
<img src="./repo_assets/img (1).png" width="512px">
<img src="./repo_assets/img (2).png" width="512px">

## **Thank you!**