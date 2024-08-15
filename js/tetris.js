import {
    PLAYFIELD_COLUMNS,
    PLAYFIELD_ROWS,
    TETROMINO_ITEMS,
    TETROMINOES,
} from "./config.js";
import {getRandomElement, rotateMatrix} from "./utils.js";

export class Tetris {
    constructor() {
        this.playfield = this.createEmptyPlayfield();
        this.tetromino = null;
        this.isGameOver = false;
        this.score = 0;
        this.speed = 700;
        this.init();
    }

    init() {
        this.createTetromino();
    }

    createEmptyPlayfield() {
        return new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
    }

    createTetromino() {
        const name = getRandomElement(TETROMINO_ITEMS);
        const matrix = TETROMINOES[name];
        const column = Math.floor(PLAYFIELD_COLUMNS / 2) - Math.floor(matrix.length / 2);
        const row = -2;

        this.tetromino = {
            name,
            matrix,
            row,
            column,
            ghostRow: row,
            ghostColumn: column,
        };

        this.calculateGhostPosition();
    }


    moveTetrominoDown() {
        this.tetromino.row += 1;
        if (!this.isValidAction()) {
            this.tetromino.row -= 1;
            this.saveTetrominoAtBottom();
        }
    }

    moveTetrominoLeft() {
        this.tetromino.column -= 1;
        if (!this.isValidAction()) {
            this.tetromino.column += 1;
        } else {
            this.calculateGhostPosition();
        }
    }

    moveTetrominoRight() {
        this.tetromino.column += 1;
        if (!this.isValidAction()) {
            this.tetromino.column -= 1;
        } else {
            this.calculateGhostPosition();
        }
    }

    rotateTetromino() {
        const oldMatrix = this.tetromino.matrix;
        this.tetromino.matrix = rotateMatrix(this.tetromino.matrix);

        if (!this.isValidAction()) {
            this.adjustRotatedPosition();

            if (!this.isValidAction()) {
                this.tetromino.matrix = oldMatrix;
            }
        }

        this.calculateGhostPosition();
    }

    adjustRotatedPosition() {
        const maxAdjustments = 2;
        for (let i = 1; i <= maxAdjustments; i++) {
            this.tetromino.column -= i;
            if (this.isValidAction()) return;

            this.tetromino.column += i;
            this.tetromino.column += i;
            if (this.isValidAction()) return;

            this.tetromino.column -= i;
        }
    }
    dropTetrominoDown() {
        this.tetromino.row = this.tetromino.ghostRow;
        this.saveTetrominoAtBottom();
    }

    isValidAction() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfGameBoard(row, column)) return false;
                if (this.isCollides(row, column)) return false;
            }
        }
        return true;
    }

    isOutsideOfGameBoard(row, column) {
        const outsideLeft = this.tetromino.column + column < 0;
        const outsideRight = this.tetromino.column + column >= PLAYFIELD_COLUMNS;
        const outsideBottom = this.tetromino.row + row >= this.playfield.length;
        return outsideLeft || outsideRight || outsideBottom;
    }

    isCollides(row, column) {
        return this.playfield[this.tetromino.row + row]?.[this.tetromino.column + column];
    }

    saveTetrominoAtBottom() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (!this.isTetrominoFitted(row)) {
                    this.isGameOver = true;
                    return;
                }

                this.playfield[this.tetromino.row + row][this.tetromino.column + column] = this.tetromino.name;
            }
        }
        this.removeFilledRows();
        this.createTetromino();
    }

    isTetrominoFitted(row) {
        return this.tetromino.row + row > 0;
    }

    removeFilledRows() {
        const filledLines = this.findFilledLines();
        filledLines.forEach(line => {
            this.dropLinesAbove(line);
        });
        this.updateScore(filledLines.length);
    }

    updateScore(lines) {
        this.score += lines * 10;
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }

    findFilledLines() {
        const filledLines = [];
        for (let row = 0; row < PLAYFIELD_ROWS; row++) {
            if (this.playfield[row].every(cell => Boolean(cell))) {
                filledLines.push(row);
            }
        }
        return filledLines;
    };

    dropLinesAbove(lineToDelete) {
        for (let row = lineToDelete; row > 0; row--) {
            this.playfield[row] = this.playfield[row - 1];
        }
        this.playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
    }

    calculateGhostPosition() {
        const tetrominoRow = this.tetromino.row;
        this.tetromino.row++;
        while (this.isValidAction()) {
            this.tetromino.row++;
        }
        this.tetromino={
            ...this.tetromino,
            ghostRow: this.tetromino.row - 1,
            ghostColumn: this.tetromino.column,
            row: tetrominoRow
        }
    }

    reset() {
        this.playfield = this.createEmptyPlayfield();
        this.tetromino = null;
        this.isGameOver = false;
        this.score = 0;
        this.init();
    }
}