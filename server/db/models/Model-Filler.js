import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cellSchema = new Schema({
    index: Number,
    row: Number,
    col: Number,
    captured: Number,
    available: String,
    fill: String
});

const modelSchema = new Schema({
        cells: {type: [cellSchema], required: true},
        rows: Number,
        cols: Number,
        lastCell: {type: Number, default: 0},
        player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Player required']},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        turn: {type: String, enum: ['player', 'opponent'], default: "player"},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


modelSchema.methods.capture = function (cell) {
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
};

const colors = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow'];
modelSchema.statics.levels = [
    {rows: 10, cols: 10, colors: colors.slice(0, 4)},
    {rows: 20, cols: 20, colors: colors.slice(0, 5)},
    {rows: 30, cols: 30, colors: colors.slice(0, 6)},
];

modelSchema.methods.available = function (cell) {
    cell.available = cell.fill;
    //updateCell(cell);
    for (const test of this.findNearCells(cell)) {
        if (test.available || test.fill !== cell.fill) continue;
        this.available(test);
    }
};

modelSchema.methods.findNearCells = function (cell) {
    const coordinates = [[-1, 0], [0, -1], [0, 1], [1, 0]];
    const found = [];
    for (const xy of coordinates) {
        const c = this.cells.find(c => c.row === cell.row + xy[0] && c.col === cell.col + xy[1]);
        if (c) found.push(c);
    }
    return found;
};

modelSchema.methods.fill = function (cell) {
    if (cell.captured) return;
    for (const h of this.cells.filter(c => c.available === cell.fill)) {
        this.capture(h);
    }
    for (const near of this.cells.filter(c => c.near)) {
        this.available(near)
    }
    for (const cap of this.cells.filter(c => c.captured)) {
        cap.fill = cell.fill;
    }
};


modelSchema.virtual('params')
    .get(function () {
        const cellWidth= 20;
        const WIDTH= cellWidth * this.cols;
        const HEIGHT = cellWidth * this.rows;
        const viewBox =  [(WIDTH) / -2, (HEIGHT) / -2, WIDTH + this.cols, HEIGHT + this.rows];

        const transform =  `translate(${-WIDTH / 2 + cellWidth / 2 + .5} ${-HEIGHT / 2 + cellWidth / 2 + .5})`;
        return {viewBox, transform, cellWidth}
    });

modelSchema.virtual('link')
    .get(function () {
        return `${process.env.SITE}/filler/${this.id}`
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('updated')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });


const Filler = mongoose.model("Filler", modelSchema);
export default Filler

