class Display {
    static async init() {
        const canvas = document.getElementById("game")
        const PieceCanvas = document.getElementById("nextPiece")
        canvas.width = boardConfig.x * pixelConfig.newWidth
        canvas.height = boardConfig.y * pixelConfig.newHeight
        PieceCanvas.width = 150
        PieceCanvas.height = 150
        const context = canvas.getContext("2d")
        const pieceContext = PieceCanvas.getContext("2d")
        const scoreElement = document.getElementById("score");
        const speedElement = document.getElementById("speed");
        const pixelImages = await LoadPixels.execute()
        return { pixelImages, context, pieceContext, scoreElement, speedElement }
    }
    static render(oldBoard, currentBoard, pixelImages, context) {
        const { x: boardX, y: boardY } = boardConfig

        for (let y = 0; y < boardY; y++) {
            for (let x = 0; x < boardX; x++) {
                if (currentBoard[y][x] !== oldBoard[y][x])
                    this.drawPixel(y, x, currentBoard[y][x], pixelImages, context)
            }
        }
    }
    static drawNextPiece(nextPiece, pixelImages, pieceContext) {
        const { piece } = nextPiece
        const centralizeY = Math.round((5 - piece.length) / 2)
        const centralizeX = Math.round((5 - piece[0].length) / 2)

        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {

                if ((y < piece.length + centralizeY && y >= centralizeY) && (x < piece[0].length + centralizeX && x >= centralizeX)) {
                    this.drawPixel(y, x, piece[y - centralizeY][x - centralizeX], pixelImages, pieceContext)
                }
                else this.drawPixel(y, x, 0, pixelImages, pieceContext)
            }
        }
    }
    static drawPixel(y, x, colorCode, pixelImages, context) {
        if (colorCode <= 0)
            this.drawEmptyPixel(y, x, colorCode, context)
        else
            this.drawColoredPixel(y, x, colorCode, pixelImages, context)
    }

    static drawEmptyPixel(y, x, colorCode, context) {
        const { newWidth, newHeight } = pixelConfig
        if (!colorCode) {
            context.fillStyle = "#000000"
            context.fillRect(x * newWidth, y * newHeight, newWidth, newHeight)
            context.strokeStyle = '#4F4F4F'
            context.strokeRect(x * newWidth, y * newHeight, newWidth, newHeight)
        }
        else {
            context.fillStyle = "#FFFFFF"
            context.fillRect(x * newWidth, y * newHeight, newWidth, newHeight)
        }
    }

    static drawColoredPixel(y, x, colorCode, pixelImages, context) {
        const { width, height, newWidth, newHeight } = pixelConfig

        const index = pixelImages.indexes[colorCode]
        const image = pixelImages.colors[index]
        context.drawImage(image, 0, 0, width, height, x * newWidth, y * newHeight, newWidth, newHeight)
    }

    static drawEmptyBoard(context) {
        const { x: boardX, y: boardY } = boardConfig

        for (let y = 0; y < boardY; y++) {
            for (let x = 0; x < boardX; x++) {
                this.drawEmptyPixel(y, x, 0, context)
            }
        }
    }
}

class LoadPixels {
    static async execute() {
        const pixels = this.referenceImages()
        await this.waitLoading(pixels)

        return pixels

    }

    static referenceImages() {
        const pixels = { colors: {}, indexes: [] }

        pixelColors.forEach(el => {
            pixels.colors[el] = new Image()
            pixels.colors[el].src = `./images/pixel-${el}.png`
        });

        pixels.indexes = Object.keys(pixels.colors)
        pixels.indexes.unshift(null)
        return pixels
    }

    static async waitLoading(pixels) {
        return new Promise((resolve) => {
            let imagesLoaded = 0

            pixelColors.forEach(el =>
                pixels.colors[el].addEventListener('load', () => {
                    imagesLoaded++
                    if (imagesLoaded === pixelColors.length) return resolve()
                })
            )
        })
    }
}
