import { TILE_STATUSES, createBoard, markTile, revealTile, checkLose, checkWin, nearbyTiles } from './minesweeper.js'

const boardElement = document.querySelector('.board')
const minesLeftText = document.querySelector('[data-mine-count]')
const messageText = document.querySelector('.subtext')
const rangeWraps = document.querySelectorAll('.range-wrap')
const startButton = document.querySelector('button')
const timer = document.querySelector('.timer')

let boardSize
let numberOfMines
let board

startButton.addEventListener('click', () => {
    startTimer()
    boardSize = Number(document.querySelector('#boardSize').innerText)
    numberOfMines = Number(document.querySelector('#numberOfMines').innerText)

    board = createBoard(boardSize, numberOfMines)

    board.forEach(row => {
        row.forEach(tile => {
            boardElement.append(tile.element)
            tile.element.addEventListener('click', () => {
                revealTile(board, tile)
                checkGameOver()
                tile.element.style.border = '2px solid yellowgreen'
            })
            tile.element.addEventListener('contextmenu', e => {
                e.preventDefault()
                markTile(tile)
                listMinesLeft()
                tile.element.style.border = '2px solid yellowgreen'
            })
        })
    })
    boardElement.style.setProperty('--size', boardSize)
    minesLeftText.textContent = numberOfMines

    rangeWraps.forEach(wrap => {
        wrap.style.display = 'none'
    })

    startButton.style.display = 'none'

    timer.style.display = 'block'

    startAI()
})

let time 
let myInterval
function startTimer() {
    time = new Date()
    myInterval = setInterval(() => {
        timer.textContent = Math.floor((new Date() - time) / 1000)
    }, 1000)
}

rangeWraps.forEach(wrap => {
    const range = wrap.querySelector('.range')
    const output = wrap.querySelector('.output')

    range.addEventListener('input', () => {
        output.textContent = range.value
    })
})


function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
    }, 0)

    minesLeftText.textContent = numberOfMines - markedTilesCount
}

function checkGameOver() {
    const win = checkWin(board)
    const lose = checkLose(board)

    if(win||lose) {
        boardElement.addEventListener('click', stopProp, {capture: true})
        boardElement.addEventListener('contextmenu', stopProp, {capture: true})
        clearInterval(myInterval)
    }

    if(win) {
        messageText.textContent = "You win!"
    }

    if(lose) {
        messageText.textContent = "You lose :("
        board.forEach(row => {
            row.forEach(tile => {
                if(tile.status === TILE_STATUSES.MARKED)
                    markTile(tile)
                if(tile.mine)
                    revealTile(board, tile)
            })
        })
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}

function startAI() {    // yes
    setTimeout(() => {
        let tile = randomTile()
        tile.element.click()
        pick()
    }, 1000)
}

function click(t) {    // yes
    setTimeout(() => {
        t.element.click()
    }, 1000)
}


function flag(t) {
    setTimeout(() => {
        markTile(t)
    }, 1000)
    console.log('FLAGGED')
}

function checkClick(tile) {
    if(!checkLose(board))
    {
        let total = 3                       // keeps track of how many of the scenarios were executed
        console.log('called checkClick')
        let hiddenTiles = []
        let flaggedTiles = []

        nearbyTiles(board, tile).forEach(item => {
            if(item.status === TILE_STATUSES.HIDDEN)
                hiddenTiles.push(item)
            if(item.status === TILE_STATUSES.MARKED)
                flaggedTiles.push(item)
        })

        let firstScenario = Number(tile.element.textContent) === hiddenTiles.length && flaggedTiles.length === 0 //if the tile's number equals the number of hidden tiles around it and the number of flagged tiles near it is 0
        let secondScenario = Number(tile.element.textContent) === flaggedTiles.length // if the tile's number equals the number of flagged tiles near it
        let thirdScenario = (flaggedTiles.length + hiddenTiles.length) === Number(tile.element.textContent) // if the number of flagged tiles near a tile + the number of hidden tiles near a tile equal the tile's number


        if(firstScenario) 
            hiddenTiles.forEach(hiddenTile => {
                flag(hiddenTile)
                console.log('first scenario done')
                total--                    // reduce total if a scenario is executed
            })
        if(secondScenario)
            hiddenTiles.forEach(hiddenTile => {
                click(hiddenTile)
                console.log('second scenario done')
                total--
            })
        if(thirdScenario)
            hiddenTiles.forEach(hiddenTile => {
                flag(hiddenTile)
                console.log(hiddenTile)
                console.log('third scenario done')
                total--
            })

        return total 
        
    }
}


function pick() {
    if(!checkLose(board))
    {
        setTimeout(() => {

            let numFullFalses = 0

            if(!checkLose(board))
            getNumberTiles().forEach(numberTile => {
                if(checkClick(numberTile) === 3)    // if none of the scenarios applied for that tile
                    numFullFalses++                 // then incremenet the number of fullFalses
            })

            if (numFullFalses === getNumberTiles().length)  // if after iterating through every number tile on the board you still couldn't execute a scenario
            {
                let hidden = getHiddenTiles()   // pick a random tile on the board
                let i = Math.floor(Math.random() * hidden.length)
                hidden[i].element.click()
            }

            pick()
        }, 1000)
    }
}


function randomTile() { // picks a random tile
    let r = Math.floor(Math.random() * boardSize)
    let c = Math.floor(Math.random() * boardSize)

    return board[r][c]
}

function getHiddenTiles() { // gets all hidden tiles
    let hidden = []

    board.forEach(row => {
        row.forEach(tile => {
            if(tile.status === TILE_STATUSES.HIDDEN)
                hidden.push(tile)
        })
    })

    return hidden
}

function getNumberTiles() { // gets all the number tiles
    let number = []

    board.forEach(row => {
        row.forEach(tile => {
            if(tile.status === TILE_STATUSES.NUMBER) 
                number.push(tile)
        })
    })

    return number
}
