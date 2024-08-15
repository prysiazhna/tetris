import { Tetris } from "./tetris.js";
import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS } from "./config.js";
import {getIndexFromPosition} from "./utils.js";

let requestId;
let timeoutId;
let isGamePaused = false;
let isGameStarted = false;
const tetris = new Tetris();
const cells = document.querySelectorAll('.grid>div');


document.getElementById('start-button').addEventListener('click', (event) => {
    toggleGame();
    event.target.blur();
});

document.getElementById('reset-button').addEventListener('click', (event) => {
    resetGame();
    event.target.blur();
});

function toggleGame() {
    if (!isGameStarted) {
        startGame();
    } else if (isGamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}
function startGame() {
    isGameStarted = true;
    isGamePaused = false;
    tetris.reset();
    document.querySelectorAll('.grid>div').forEach(cell => {
        cell.textContent = '';
        cell.removeAttribute('class');
    });

    tetris.speed = parseInt(document.getElementById('difficulty').value);
    moveDown();
    initKeydown();
    document.getElementById('difficulty').disabled = true;
    document.getElementById('reset-button').disabled = false;
    updateStartButtonText();
    document.addEventListener('keydown', onKeydown);
}

function pauseGame() {
    isGamePaused = true;
    stopLoop();
    updateStartButtonText();
    document.removeEventListener('keydown', onKeydown);
}

function resumeGame() {
    isGamePaused = false;
    moveDown();
    initKeydown();
    updateStartButtonText();
    document.addEventListener('keydown', onKeydown);
}

function resetGame() {
    stopLoop();
    isGameStarted = false;
    isGamePaused = false;
    tetris.reset();
    document.querySelectorAll('.grid>div').forEach(cell => {
        cell.textContent = '';
        cell.removeAttribute('class');
    });
    document.getElementById('difficulty').disabled = false;
    document.getElementById('reset-button').disabled = true;

    updateStartButtonText();
    document.removeEventListener('keydown', onKeydown);
}

function updateStartButtonText() {
    const startButton = document.getElementById('start-button');
    if (!isGameStarted) {
        startButton.textContent = 'Start Game';
    } else if (isGamePaused) {
        startButton.textContent = 'Resume Game';
    } else {
        startButton.textContent = 'Pause Game';
    }
}

function initKeydown() {
    document.addEventListener('keydown', onKeydown);
}

function onKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveDown()
            break;
        case 'ArrowLeft':
            moveLeft()
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case ' ':
            dropDown();
            break;
        default:
            return;
    }
}

function moveDown(speed = 700) {
    tetris.moveTetrominoDown();
    draw();
    stopLoop();
    startLoop(speed);

    if (tetris.isGameOver) {
        gameOver();
    }
}

function moveLeft() {
    tetris.moveTetrominoLeft();
    draw();
}

function moveRight() {
    tetris.moveTetrominoRight();
    draw();
}

function rotate() {
    tetris.rotateTetromino();
    draw();
}

function dropDown() {
    tetris.dropTetrominoDown();
    draw();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}

function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), tetris.speed);
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayfield();
    drawTetromino();
    drawGhostTetromino();
}

function drawPlayfield() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!tetris.playfield[row][column]) continue;
            const name = tetris.playfield[row][column];
            const cellIndex = getIndexFromPosition(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    drawMatrix(tetris.tetromino.matrix, tetris.tetromino.row, tetris.tetromino.column, tetris.tetromino.name);
}

function drawGhostTetromino() {
    drawMatrix(tetris.tetromino.matrix, tetris.tetromino.ghostRow, tetris.tetromino.ghostColumn, 'ghost');
}
function drawMatrix(matrix, baseRow, baseColumn, className) {
    const matrixSize = matrix.length;
    for (let rowIndex = 0; rowIndex < matrixSize; rowIndex++) {
        for (let columnIndex = 0; columnIndex < matrixSize; columnIndex++) {
            if (matrix[rowIndex][columnIndex] && baseRow + rowIndex >= 0) {
                const cellIndex = getIndexFromPosition(baseRow + rowIndex, baseColumn + columnIndex);
                cells[cellIndex].classList.add(className);
            }
        }
    }
}

function gameOver() {
    stopLoop();
    document.removeEventListener('keydown', onKeydown);
    document.getElementById('start-button').disabled = false;
    document.getElementById('difficulty').disabled = false;
    gameOverAnimation();
    setTimeout(() => drawGameOver(), 1000);


}
function drawGameOver() {
    const message = "GAME  OVER";
    const row = 9;
    const columnOffset = Math.floor((PLAYFIELD_COLUMNS - message.length) / 2);

    for (let i = 0; i < message.length; i++) {
        const cellIndex = getIndexFromPosition(row, columnOffset + i);
        cells[cellIndex].textContent = message[i];
        cells[cellIndex].classList.add('game-over');
    }
}

function gameOverAnimation() {
    const filledCells = [...cells].filter(cell => cell.classList.length > 0);
    filledCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('hide'), i * 10);
        setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
    });
}
