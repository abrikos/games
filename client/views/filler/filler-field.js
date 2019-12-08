import React, {useEffect, useState} from 'react';
import "./filler.sass"
import Loader from "client/components/Loader";
import AccessDenied from "client/service/access-denied";
import AcceptFiller from "client/views/filler/AcceptFiller";
import {t} from "client/components/Translator"

const style = {
    border: '1px solid black',
};


export default function FillerField(props) {
    if (!props.authenticatedUser) {
        //navigate('/login');
        return <AccessDenied/>;
    }

    const [filler, setFiller] = useState();
    const [cells, setCells] = useState();
    const [turn, setTurn] = useState();

    //const [cells, updateCell] = useReducer(reducer, Filler.cells);

    function updateCell(cell) {
        if (turn === 'guest') return;
        const cls = cells.map(c => c);
        cls[cell.index] = cell;
        setCells(cls)
    }

    useEffect(() => {
        props.api(`/filler/${props.id}/view`)
            .then(res => {
                setFiller(res);
                setCells(res.opponent.id === props.authenticatedUser.id ? res.cells.reverse() : res.cells)
            })

    }, []);


    function mouseOut(e) {
        for (const c of cells) {
            delete c.hover;
            updateCell(c)
        }

    }

    function mouseOver(e) {
        const cell = cells.find(c => c._id === e.target.getAttribute('_id'));

        for (const h of cells.filter(c => c.available === cell.fill)) {
            h.hover = 1;
            updateCell(h)
        }
    }

    function cellClick(e) {
        props.api(`/filler/${filler.id}/click/${e.target.getAttribute('_id')}`)
            .then(res => {
                setFiller(res);
                setCells(res.cells)
            })

    }

    function getOpacity(cell) {
        return cell.captured || cell.hover ? 1 : .4
    }

    function rows() {
        const table = [];
        /*for (let row = 0; row < filler.rows; row++) {
            const row = <tr key={row}>{cells.filter(c => c.row === row)
                .map(c => <td key={c.index} id={c._id} style={{backgroundColor: c.fill, opacity: getOpacity(c)}} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut}>
                    {c.available}
                </td>)}
            </tr>;
            table.push(row)
        }*/
        for(let i= 0; i < cells.length; i++){

        }
        return table;
    }

    function coordinates(c, i) {
        let row = Math.floor(i / filler.cols);
        let col = i % filler.cols;
        const r = {x: col * filler.params.cellWidth - filler.params.cellWidth / 2 + col, y: row * filler.params.cellWidth - filler.params.cellWidth / 2 + row, width: filler.params.cellWidth, height: filler.params.cellWidth};
        console.log(row, col)
        return r;
    }

    if (!cells) return <Loader/>;
    return <div>
        {filler.player.first_name} vs {filler.opponent ? filler.opponent.name : props.authenticatedUser.id === filler.player.id ? '...' : <span>{t('You')} <AcceptFiller filler={filler} {...props}/></span>}
        {/*<table id={'filler-table'}>
            <tbody>
            {rows()}
            </tbody>
        </table>*/}
        <svg
            id={'filler-field'}
            viewBox={filler.params.viewBox}
            style={style}
        >
            <g transform={filler.params.transform}>
                {cells.map((c, i) => <rect key={c.index} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut} fillOpacity={getOpacity(c)} {...c} {...coordinates(c, i)}/>)}
            </g>
        </svg>
    </div>
}
