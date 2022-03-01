const { pieces, pixelColors, pixelConfig, boardConfig, frequency, initialSpeed, noRepeatedPiecesSequence } = configs

let gameLoaded
let displayElements
let frame
let context
let score
let currentSpeed
let currentCommand
let pixelImages
let gameState
let currentBoard
let oldBoard
let piece
let indexPiece
let lastPieceCoordinates
let indexColor
let removingLines
let lastPieces
let scoreElement
let speedElement
let pieceContext
let nextPiece
let running
let lastRenderedFrame


class GameController {
    static async loop() {
        if (!gameLoaded) await GameController.loadGame()
        if (!frame) GameController.resetGame()

        currentCommand = Listener.getCommand(frame, currentSpeed, piece, removingLines, running)

        if (currentCommand) {
            GameController.updateGameState()
            GameController.checkGameOver()
        }

        frame++
        if (frame === 100000000) frame = 1
    }

    static async loadGame() {
        Listener.init()
        displayElements = await Display.init()

        pixelImages = displayElements.pixelImages
        context = displayElements.context
        pieceContext = displayElements.pieceContext
        scoreElement = displayElements.scoreElement
        speedElement = displayElements.speedElement

        gameLoaded = true
    }

    static resetGame() {
        currentBoard = GameLogic.generateBoard(0)
        currentSpeed = initialSpeed
        score = 0
        frame = 1
        lastPieces = {}
        lastPieces.lastFourPieces = []
        lastPieces.lastFourColors = []
        nextPiece = GeneratePiece.execute(0, 0, lastPieces)
        piece = false

        Display.drawEmptyBoard(context)
        Display.drawNextPiece(nextPiece, pixelImages, pieceContext)
    }

    static updateGameState() {
        do {
            oldBoard = JSON.parse(JSON.stringify(currentBoard))

            gameState = GameLogic.updateBoard(currentBoard, currentCommand, piece, lastPieceCoordinates, indexPiece, indexColor, lastPieces, removingLines, frame, currentSpeed, score, nextPiece)

            currentBoard = gameState.collision ? oldBoard : gameState.board
            piece = gameState.piece
            lastPieceCoordinates = gameState.pieceCoordinates
            indexPiece = gameState.indexPiece
            indexColor = gameState.indexColor
            removingLines = gameState.removingLines
            lastPieces = gameState.lastPieces
            currentSpeed = gameState.currentSpeed
            score = gameState.score
            nextPiece = gameState.nextPiece
            scoreElement.innerHTML = score
            speedElement.innerHTML = (5 + (initialSpeed - currentSpeed) / frequency) / 5

            Display.render(oldBoard, currentBoard, pixelImages, context)
            Display.drawNextPiece(nextPiece, pixelImages, pieceContext)
        } while (currentCommand === 'Space' && !gameState.collision)

        if (currentCommand === 'Space') piece = false
    }

    static checkGameOver() {
        if (gameState.collision && lastPieceCoordinates.y <= 0 && currentCommand === 'ArrowDown') {
            alert(
                `
            Game Over!
            Score: ${score}`
            )
            frame = -1
        }
    }

    static startEvent() {
        running = !running

        if (!running) {
            document.getElementById('start').src = './images/button-play.png'
            lastRenderedFrame = frame
        }
        else {
            document.getElementById('start').src = './images/button-pause.png'
            frame = lastRenderedFrame
        }
    }

    static restartEvent() {
        frame = 0
        lastRenderedFrame = 1
    }
}

setInterval(GameController.loop, frequency)
