import Config from 'client/games/minesweeper/config';

class Cell {
    mines = 0;
    status = 'initial';
    text = '';
    flag = false;
    pressed = false;

    constructor(props) {
        this.i = props.i;
        this.col = props.col;
        this.row = props.row;
    }

    getClass = () => {
        if(this.status==='checked' && this.mines) return 'bomb-near';
        if(this.flag) return 'flag';
        return this.status;
    };

    getImage = () => {
        if(this.mines) return this.mines;
        if(this.flag) return 'flag';
        return this.status;
    };


    getCoordinate() {
        return `${this.row}-${this.col}`;
    }
}

class Field {
    #mines = [];
    cheater = Config.cheater;
    status = 'standby';

    constructor(level) {
        console.log('CREATE NEW FIELD')
        this.key = new Date().valueOf()
        this.level = Config.levels[level];
        let field = Array.from(Array(this.level.rows * this.level.cols).keys());
        this.rows = new Array(this.level.rows);
        this.cols = Array.from(Array(this.level.cols).keys());

        this.cells = field.map(i => {
            let row = Math.floor(i / this.level.cols);
            let col = i % this.level.cols;
            return new Cell({i, row, col});
        });
    }

    minesLeft() {
        return this.level.mines - this.cells.filter(c => c.flag).length
    }

    click(cell) {
        if (this.isFinished()) return;
        let c = this.getCell(cell);
        this.setMines(cell);
        if (c.flag) return;
        if (this.isMine(cell)) {
            cell.status = 'this-mine';
            this.gameOver(cell);
        } else {
            cell.status = 'checked';
            c.mines = this.countMines(cell);
        }
        this.crowler(c);
        this.isWin();
    }

    isFinished() {
        return !['play', 'standby'].includes(this.status)
    }

    isWin() {
        let initial = this.cells.filter(c => c.getClass() === 'initial');
        if (initial.length - (this.level.mines - (this.cheater ? this.level.mines : 0)) === 0) {
            this.status = 'win';
            this.#mines.map(c => {
                c.flag = true;
                return c;
            })
        }
    }

    crowler(cell) {
        if (cell.mines > 0) {
            return;
        }
        const beChecked = [1, 3, 5, 7]
        for (const i of beChecked) {
            let row = Math.floor(i / 3);
            let col = i % 3;
            let test = this.getCell({row: cell.row - 1 + row, col: cell.col - 1 + col});
            if (test && !this.isSameCell(cell, test) && test.status === 'initial') {
                test.mines = this.countMines(test);
                test.status = 'checked';
                //test.status = test.mines ? 'mines' : 'empty'
                this.crowler(test);
            }
        }

    }

    isMine(cell) {
        return this.#mines.find(c1 => this.isSameCell(c1, cell))
    }

    countMines(cell) {
        let bombsFound = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let c2 = {col: cell.col + i, row: cell.row + j};
                let bomb = this.#mines.find(c1 => this.isSameCell(c1, c2));
                if (bomb) {
                    bombsFound = bombsFound + 1;
                }
            }
        }
        return bombsFound;
    }

    setMines(cell) {
        if (this.#mines.length) return;
        let mines = this.cells.filter(c => !this.isSameCell(c, cell));
        mines.sort(function () {
            return 0.5 - Math.random()
        });
        this.#mines = mines.slice(0, this.level.mines);
        //FIXED FIELD
        //const placed = [1, 8, 10, 12, 14, 17, 20, 25, 30, 40];        this.#mines = [];        for (const i of placed) this.#mines.push(this.cells[i]);

        if (this.cheater) {
            this.#mines.map(c => {
                c.status = 'cheater';
                return c;
            })
        }
        this.status = 'play';
    }

    gameOver(cell) {
        this.#mines.map(c => {

            if (this.isSameCell(c, cell))
                c.status = 'this-mine';
            else
                c.status = 'bomb';
            return c;
        });
        this.status = 'gameover';
        this.cells.map(c => {
            if (c.flag) {
                console.log(c);
                c.flag = false;
                if (c.status === 'initial')
                    c.mines = 'bomb-false';
            }
            return c;
        })
    }


    isSameCell(c1, c2) {
        return c1.row === c2.row && c1.col === c2.col
    }

    getCell(cell) {
        return this.cells.find(c => this.isSameCell(c, cell))
    }

    setFlag(coordinate) {
        const flags = this.cells.filter(c => c.flag);
        let cell = this.getCell(coordinate);
        if (!cell) return;
        cell.flag = !cell.flag;
        if (this.level.mines - flags.length > 0) return;
        cell.flag = false
    }

}

export default Field;
