export default class FillerField {
    constructor(props) {
        if (props) {
            for (const key of Object.keys(props)) this[key] = props[key]
        } else {
            this.cells = [];
            this.cols = 20;
            this.rows = 20;
            this.colors = ['green', 'red', 'blue'];
        }


        for (let index = 0; index < this.rows * this.cols; index++) {
            let row = Math.floor(index / this.cols);
            let col = index % this.cols;
            const fill = this.randomColor();
            this.cells.push({index, row, col, fill})
        }
    }

    randomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    capture(cell) {
        cell.captured = 1;
        for (const near of this.findNearCells(cell)) {
            if (near.captured || near.near) continue;
            near.near = 1;
            //updateCell(near)
        }
        //updateCell(cell);
        //const coordinates = [[-1, 0], [0, -1], [0, 1], [1, 0]];
        for (const test of this.findNearCells(cell)) {
            //const test = cells.find(c => c.row === cell.row + xy[0] && c.col === cell.col + xy[1]);
            if (test.captured) continue;
            if (cell.fill === test.fill) {
                test.captured = 1;
                this.capture(test)
            }
        }
    }

    available(cell) {
        cell.available = cell.fill;
        //updateCell(cell);
        for (const test of this.findNearCells(cell)) {
            if (test.available || test.fill !== cell.fill) continue;
            this.available(test);
        }
    }

    findNearCells(cell) {
        const coordinates = [[-1, 0], [0, -1], [0, 1], [1, 0]];
        const found = [];
        for (const xy of coordinates) {
            const c = this.cells.find(c => c.row === cell.row + xy[0] && c.col === cell.col + xy[1]);
            if (c) found.push(c);
        }
        return found;
    }

    fill(cell) {
        if (cell.captured) return;
        for (const h of this.cells.filter(c => c.available === cell.fill)) {

            this.capture(h);
        }
        for (const near of this.cells.filter(c => c.near)) {
            this.available(near)
        }
        for (const cap of this.cells.filter(c => c.captured)) {
            cap.fill = cell.fill;
            //this.updateCell(cap)
        }
    }

}
