class GameLogic {
    static updateBoard(board, command, piece, pieceCoordinates, indexPiece, indexColor, lastPieces, removingLines, frame, currentSpeed, score, nextPiece) {
        if (removingLines) {
            this.removePixelsAnimation(board, removingLines, frame)
            if (removingLines.finish) {
                this.removeCompleteLines(board, removingLines)
                removingLines = false
            }
        }
        if (!piece) {
            const completeLines = this.checkCompleteLines(board)
            const completeLinesQuantity = completeLines.length

            if (completeLinesQuantity > 0) removingLines = { completeLines, pixelsRemoved: 0, lastFrame: frame, finish: false }

            const pieceInformation = nextPiece
            piece = pieceInformation.piece
            indexPiece = pieceInformation.indexPiece
            indexColor = pieceInformation.indexColor
            lastPieces = pieceInformation.lastPieces

            nextPiece = GeneratePiece.execute(indexPiece, indexColor, lastPieces)

            pieceCoordinates = { x: parseInt((boardConfig.x - piece[0].length) / 2, 10), y: piece.length * -1 }

            if (completeLinesQuantity > 0 && currentSpeed > 100) currentSpeed -= frequency

            if (completeLinesQuantity === 4) {
                score += completeLinesQuantity * 200
            }
            else if (completeLinesQuantity > 0) {
                score += completeLinesQuantity * 100
            }
        }
        this.clearLastPiecePosition(board, piece, pieceCoordinates)
        const currentBoard = this.updatePieceInBoard(board, piece, command, pieceCoordinates, removingLines)
        return { ...currentBoard, indexPiece, indexColor, lastPieces, currentSpeed, score, nextPiece, removingLines }
    }

    static generateBoard(content = 0) {
        const { x: boardX, y: boardY } = boardConfig
        const currentBoard = []

        for (let y = 0; y < boardY; y++) {
            currentBoard.push([])
            for (let x = 0; x < boardX; x++) {
                currentBoard[y].push(content)
            }
        }
        return currentBoard
    }

    static clearLastPiecePosition(board, piece, lastPieceCoordinates) {
        const { x: boardX, y: boardY } = boardConfig
        let { y: yP, x: xP } = lastPieceCoordinates

        for (let y = 0; y < boardY; y++) {
            for (let x = 0; x < boardX; x++) {

                if ((y >= yP && y < yP + piece.length) && (x >= xP && x < xP + piece[0].length)) {
                    if (piece[y - yP][x - xP] !== 0) board[y][x] = 0
                }
            }
        }
        return board
    }

    static updatePieceInBoard(board, piece, command, lastPieceCoordinates, removingLines, revision = false) {
        if (removingLines) return { board, piece, pieceCoordinates: lastPieceCoordinates, collision: false }

        const lastValidBoard = JSON.parse(JSON.stringify(board))
        const lastValidPiece = JSON.parse(JSON.stringify(piece))
        const lastValidCoordinates = JSON.parse(JSON.stringify(lastPieceCoordinates))
        let collision = false

        const { x: boardX, y: boardY } = boardConfig

        const possibleMoves = {
            ArrowUp: ({ x, y }) => { return { x, y } },
            ArrowDown: ({ x, y }) => { return { x, y: y + 1 } },
            ArrowRight: ({ x, y }) => { return { x: x + 1, y } },
            ArrowLeft: ({ x, y }) => { return { x: x - 1, y } },
            Space: ({ x, y }) => { return { x, y: y + 1 } }
        }
        if (command === 'ArrowUp' && !revision) {
            const newPiece = this.rotatePiece(piece, lastPieceCoordinates)
            piece = newPiece.newPiece
            lastPieceCoordinates = newPiece.newCoordinates
        }

        let pieceCoordinates = revision ? lastPieceCoordinates : possibleMoves[command](lastPieceCoordinates)
        if (pieceCoordinates.x < 0) collision = true
        if (pieceCoordinates.x + piece[0].length > boardX) collision = true
        if (pieceCoordinates.y + piece.length > boardY) collision = true

        let { y: yP, x: xP } = pieceCoordinates

        for (let y = 0; y < boardY; y++) {
            for (let x = 0; x < boardX; x++) {

                if ((y >= yP && y < yP + piece.length) && (x >= xP && x < xP + piece[0].length)) {
                    if (piece[y - yP][x - xP] !== 0) {
                        collision = collision || this.checkCollision(board[y][x], piece, yP, xP)
                        board[y][x] = piece[y - yP][x - xP]
                    }
                }
            }
        }

        if (collision && command === 'ArrowUp' && !revision) return this.removeCollisionFromRotatedPiece(board, lastValidBoard, piece, lastPieceCoordinates) || { board: lastValidBoard, piece: lastValidPiece, pieceCoordinates: lastValidCoordinates, collision: true }
        if (collision && command === 'ArrowDown') piece = false
        if (collision) pieceCoordinates = lastPieceCoordinates

        return { board, piece, pieceCoordinates, collision }
    }

    static checkCollision(pixel, piece, y, x) {
        const { x: boardX, y: boardY } = boardConfig

        if (pixel)
            return true

        if ((y + piece.length) > boardY)
            return true

        if ((x + piece[0].length) > boardX)
            return true

        if (x < 0)
            return true

        return false
    }

    static rotatePiece(piece, Coordinates) {
        let newPiece = []
        let newCoordinates = {}

        if (piece.length === 1 || piece[0].length === 1) {
            if (piece.length > piece[0].length) newCoordinates = { x: Coordinates.x - 1, y: Coordinates.y + 2 }
            else newCoordinates = { x: Coordinates.x + 1, y: Coordinates.y - 2 }
        }
        else newCoordinates = Coordinates

        if (!this.reverseOrder) this.reverseOrder = true

        const width = piece[0].length
        const height = piece.length

        for (let y = 0; y < width; y++) {
            newPiece.push([])
            if (this.reverseOrder) {
                for (let x = height - 1; x >= 0; x--) {
                    newPiece[y].push(piece[x][y])
                }
            }
            else {
                for (let x = 0; x < height; x++) {
                    newPiece[y].push(piece[x][y])
                }
            }
        }
        this.reverseOrder = !this.reverseOrder
        return { newPiece, newCoordinates }
    }

    static removeCollisionFromRotatedPiece(board, lastValidBoard, piece, lastPieceCoordinates) {
        const moves = ['ArrowLeft', 'ArrowRight', 'ArrowUp']

        const possibleMoves = {
            ArrowUp: ({ x, y }) => { return { x, y: y - 1 } },
            ArrowRight: ({ x, y }) => { return { x: x + 1, y } },
            ArrowLeft: ({ x, y }) => { return { x: x - 1, y } }
        }

        for (let i = 0; i < moves.length; i++) {
            let pieceCoordinates = lastPieceCoordinates
            let limit = moves[i] === 'ArrowUp' ? piece.length : piece[0].length

            for (let j = 0; j < limit; j++) {
                const response = this.updatePieceInBoard(board, piece, moves[i], pieceCoordinates, false, true)

                if (!response.collision) return response

                board = JSON.parse(JSON.stringify(lastValidBoard))
                pieceCoordinates = possibleMoves[moves[i]](pieceCoordinates)
            }
        }
        return false
    }

    static checkCompleteLines(board) {
        const { x: boardX, y: boardY } = boardConfig
        const completeLines = []

        for (let y = 0; y < boardY; y++) {
            let completeLine = true
            for (let x = 0; x < boardX; x++) {
                if (!board[y][x]) completeLine = false
            }
            if (completeLine) completeLines.push(y)
        }
        return completeLines
    }
    static removePixelsAnimation(board, removingLines, frame) {
        const { completeLines, pixelsRemoved, lastFrame } = removingLines
        const { x: boardX, y: boardY } = boardConfig

        if (frame - lastFrame === 4) {
            const colorCode = (!this.backGround && completeLines.length === 4) ? -1 : 0

            for (let i = 0; i < completeLines.length; i++) {
                board[completeLines[i]][parseInt(boardX / 2) - pixelsRemoved - 1] = colorCode
                board[completeLines[i]][parseInt(boardX / 2) + pixelsRemoved] = colorCode
            }

            removingLines.pixelsRemoved++
            removingLines.lastFrame = frame
            if (pixelsRemoved === parseInt(boardX / 2) - 1) removingLines.finish = true

            for (let y = 0; y < boardY; y++) {
                for (let x = 0; x < boardX; x++) {
                    if (board[y][x] <= 0) {
                        board[y][x] = removingLines.finish ? 0 : colorCode
                    }
                }
            }
            this.backGround = !this.backGround
        }
    }

    static removeCompleteLines(board, removingLines) {
        const { completeLines } = removingLines
        const { x: boardX } = boardConfig

        for (let y = 0; y < completeLines.length; y++) {
            board.splice(completeLines[y], 1)
            board.unshift([])
            for (let i = 0; i < boardX; i++) {
                board[0].push(0)
            }
        }
    }
}

class GeneratePiece {
    static execute(lastPiece, lastColor, lastPieces) {
        const lastFourPieces = this.renewArray(lastPieces.lastFourPieces, lastPiece)
        const lastFourColors = this.renewArray(lastPieces.lastFourColors, lastColor)
        const indexPiece = this.getRandomIndex(Object.keys(pieces).length, lastFourPieces)
        const indexColor = this.getRandomIndex(pixelColors.length + 1, lastFourColors)
        const piece = this.getColoredPiece(indexPiece, indexColor)

        return { piece, indexPiece, indexColor, lastPieces: { lastFourPieces, lastFourColors } }
    }

    static renewArray(array, newElement) {
        if (array.length >= noRepeatedPiecesSequence) array.shift()
        array.push(newElement)

        return array
    }
    static getRandomIndex(size, latestIndexes) {
        let random = 0
        while (random === 0 || latestIndexes.indexOf(random) !== -1) {
            random = parseInt(Math.random() * size, 10)
        }
        return random
    }

    static getColoredPiece(piece, color) {
        const index = Object.keys(pieces)[piece]
        piece = pieces[index]

        const targetY = piece.length
        const targetX = piece[0].length

        for (let y = 0; y < targetY; y++) {
            for (let x = 0; x < targetX; x++) {
                if (piece[y][x] !== 0) piece[y][x] = color
            }
        }
        return piece
    }
}
