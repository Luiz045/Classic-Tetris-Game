let command = ''
class Listener {
    static init() {
        const clickableElement = document.getElementsByClassName("clickableElement")

        for (let i = 0; i < clickableElement.length; i++) {
            clickableElement[i].addEventListener('click', function () {
                this.blur()
            })
        }

        document.addEventListener('keydown', this.registerEvent)
    }

    static registerEvent(event) {
        const index = configs.acceptableMoves.indexOf(event.key === ' ' ? event.code : event.key)
        if (index !== -1) command = configs.acceptableMoves[index]
    }

    static getCommand(frame, speed, piece, removingLines, running) {
        let response = ''

        if (command) {
            response = command
            command = ''
        }

        else if ((frame * frequency) % speed === 0)
            response = 'ArrowDown'

        if (!piece || removingLines)
            response = 'ArrowDown'

        if (!running) {
            command = ''
            response = ''
        }

        return response
    }
}
