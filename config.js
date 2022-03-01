const configs = {
    pieces: {
        el: null,
        I: [
            [1],
            [1],
            [1],
            [1]
        ],
        L: [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
        O: [
            [1, 1],
            [1, 1],
        ],
        R: [
            [1, 1],
            [1, 0],
            [1, 0]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        T: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
        ]

    },
    pixelColors: [
        'blue',
        'cyan',
        'green',
        'orange',
        'purple',
        'red',
        'yellow'
    ],
    pixelConfig: {
        width: 24,
        height: 24,
        newWidth: 30,
        newHeight: 30
    },
    boardConfig: {
        x: 10,
        y: 20
    },
    acceptableMoves: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Space'],
    frequency: 20,
    initialSpeed: 1000,
    noRepeatedPiecesSequence: 4
}
