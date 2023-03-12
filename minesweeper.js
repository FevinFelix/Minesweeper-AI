export const TILE_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
}

export function createBoard(boardSize, numberOfMines) {                 // fills a board with all necessary tiles
    const board = []
    const minePositions = getMinesPositions(boardSize, numberOfMines)

    for(let r = 0; r < boardSize; r++) {
        const row = []

        for(let c = 0; c < boardSize; c++) {
            const element = document.createElement('div')
            element.dataset.status = TILE_STATUSES.HIDDEN
            const tile = {
                element,
                r,
                c,
                mine: minePositions.some(p => positionMatch(p, {r, c})),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                },
            }

            row.push(tile)
        }
        board.push(row)
    }
    return board
}

export function markTile(tile) {
    // if(tile.status !== TILE_STATUSES.HIDDEN &&
    //     tile.status !== TILE_STATUSES.MARKED) {
    //         return
    //     }

    if(tile.status === TILE_STATUSES.HIDDEN) {
        tile.status = TILE_STATUSES.MARKED
            return
        }
    // else {
    //     tile.status = TILE_STATUSES.HIDDEN
    // }
}

export function revealTile(board, tile) {
    if(tile.status !== TILE_STATUSES.HIDDEN) {
        return
    }

    if(tile.mine) {
        tile.status = TILE_STATUSES.MINE
        return
    }

    tile.status = TILE_STATUSES.NUMBER
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)     // keepng any tiles that are mines
    if(mines.length == 0) {
        adjacentTiles.forEach(t => revealTile(board, t))
    } else {        // adjacent mines are present - Ty comment
        tile.element.textContent = mines.length
    }
}

function getMinesPositions(boardSize, numberOfMines) {
    const positions = []

    while(positions.length < numberOfMines) {
        const position = {
            r: Math.floor(Math.random() * boardSize),
            c: Math.floor(Math.random() * boardSize),
        }

        if(!positions.some(p => positionMatch(p, position))) {
            positions.push(position)
        }
    }

    return positions
}

function positionMatch(a, b) {      // a and b are position objects
    return a.r === b.r &&
            a.c === b.c
}

export function nearbyTiles(board, {r, c}) {       // destructure:
    const tiles = []

    for(let rOffset = -1; rOffset <= 1; rOffset++) {
        for(let cOffset = -1; cOffset <= 1; cOffset++) {
            const tile = board[r + rOffset]?.[c + cOffset]
            if(tile) {
                tiles.push(tile)
            }
        }
    }

    return tiles
}

export function checkWin(board) {   
    return board.every(row => {
        return row.every(tile => {
            return tile.status === TILE_STATUSES.NUMBER ||
                    (tile.mine && (tile.status === TILE_STATUSES.HIDDEN ||
                                    tile.status === TILE_STATUSES.MARKED))
        })
    })
}

export function checkLose(board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === TILE_STATUSES.MINE
        })
    })
}