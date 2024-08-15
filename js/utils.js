import {PLAYFIELD_COLUMNS} from "./config.js";

export function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export function rotateMatrix(matrix) {
    const N = matrix.length;
    const rotatedMatrix = [];
    for (let i = 0; i < N; i++) {
        rotatedMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotatedMatrix[i][j] = matrix[N - j - 1][i];
        }
    }
    return rotatedMatrix;
}

export function getIndexFromPosition(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}