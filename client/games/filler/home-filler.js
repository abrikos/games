import React, {useEffect, useState} from 'react';
import "./filler.sass"
import filler from "./Filler"

const Filler = new filler()


const style = {
    border: '1px solid black',
};


export default function HomeFiller(props) {
    const [cells, setCells] = useState(Filler.cells);

    //const [cells, updateCell] = useReducer(reducer, Filler.cells);

    function updateCell(cell) {
        const cls = cells.map(c => c);
        cls[cell.index] = cell;
        setCells(cls)
    }

    useEffect(() => {
        const cell = cells[0];
        cell.available = cell.fill;
        fill(cell)
    }, [])

    function mouseOut(e) {
        for (const c of cells) {
            delete c.hover;
            updateCell(c)
        }

    }

    function mouseOver(e) {
        const cell = cells[e.target.getAttribute('index')];
        for (const h of cells.filter(c => c.available === cell.fill)) {
            h.hover = 1;
            updateCell(h)

        }
        //  if (cell.ready && !cell.choosen) capture(cell)
        //setCells(newCells)
    }

    function capture(cell) {
        cell.captured = 1;
        for (const near of findNearCells(cell)) {
            if(near.index===150) console.log(near)
            if(near.captured || near.near) continue;
            near.near = 1;
            //updateCell(near)
        }
        updateCell(cell);
        //const coordinates = [[-1, 0], [0, -1], [0, 1], [1, 0]];
        for (const test of findNearCells(cell)) {
            //const test = cells.find(c => c.row === cell.row + xy[0] && c.col === cell.col + xy[1]);
            if (test.captured) continue;
            if (cell.fill === test.fill) {
                test.captured = 1
                capture(test)
            }
        }
    }

    function available(cell) {
        cell.available = cell.fill;
        updateCell(cell);
        for (const test of findNearCells(cell)) {
            if (test.available || test.fill!==cell.fill) continue;
            available(test);
        }
    }

    function findNearCells(cell) {
        const coordinates = [[-1, 0], [0, -1], [0, 1], [1, 0]];
        const found = [];
        for (const xy of coordinates) {
            const c = cells.find(c => c.row === cell.row + xy[0] && c.col === cell.col + xy[1]);
            if (c) found.push(c);
        }
        return found;
    }

    function cellClick(e) {
        const cell = cells[e.target.getAttribute('index')];
        if(cell.captured) return;
        fill(cell);

    }

    function fill(cell) {
        if (cell.captured ) return;
        for (const h of cells.filter(c => c.available === cell.fill)) {
            capture(h);
        }
        for(const near of cells.filter(c=>c.near)){
            available(near)
        }
        for(const cap of cells.filter(c=>c.captured)){
            cap.fill = cell.fill;
            updateCell(cap)
        }
    }

    function getOpacity(cell) {
        return cell.captured || cell.hover ? 1 : .4
    }

    function rows() {
        const table = []
        for (let row = 0; row < Filler.rows; row++) {
            const row = <tr key={row}>{cells.filter(c => c.row === row).map(c => <td key={c.index} index={c.index} style={{backgroundColor: c.fill, opacity: getOpacity(c)}} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut}>
                {c.near}
            </td>)}</tr>

            table.push(row)
        }
        return table;
    }

    return <div>
        Filler
        <table id={'filler-table'}>
            <tbody>
            {rows()}
            </tbody>
        </table>
        {/*<svg
            id={'filler-field'}
            viewBox={Filler.viewBox}
            style={style}
        >
            <g transform={Filler.transform}>
                {cells.map(c => <rect key={c.index} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut} fillOpacity={getOpacity(c)}  {...c}/>)}
            </g>
        </svg>*/}
    </div>
}
