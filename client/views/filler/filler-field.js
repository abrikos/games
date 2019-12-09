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
    const [cells, setCells] = useState([]);

    //const [cells, updateCell] = useReducer(reducer, Filler.cells);

    useEffect(() => {
        props.api(`/filler/${props.id}/view`)
            .then(res => {
                setFiller(res);
                setCells(reverseCells(res))
            })

    }, []);

    function reverseCells(res) {
        return res.opponent && res.opponent.id === props.authenticatedUser.id ? res.cells.reverse() : res.cells
    }

    function mouseOut(e) {
        const cls = [];
        for (const c of cells) {
            delete c.hover;
            cls.push(c)
        }
        setCells(cls)
    }

    function mouseOver(e) {
        const cell = cells.find(c => c._id === e.target.getAttribute('_id'));
        const cls = cells.map(c => c);
        for (const h of cls.filter(c => c.availableFill === cell.fill && c.availableUser === props.authenticatedUser._id)) {
            h.hover = 1;
        }
        setCells(cls)
    }

    function cellClick(e) {
        props.api(`/filler/${filler.id}/click/${e.target.getAttribute('_id')}`)
            .then(res => {
                setFiller(res);
                setCells(reverseCells(res))
            })

    }

    function getOpacity(cell) {
        return cell.captured || cell.hover ? 1 : .4
    }

    function rows() {
        const table = [];
        for (let row = 0; row < filler.rows; row++) {
            const row = <tr key={row}>{cells.filter(c => c.row === row)
                .map(c => <td key={c.index} _id={c._id} style={{backgroundColor: c.fill, opacity: getOpacity(c)}} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut}>
                    {c.availableUser}
                </td>)}
            </tr>;
            table.push(row)
        }
        return table;
    }

    function coordinates(c, i) {
        let row = Math.floor(i / filler.cols);
        let col = i % filler.cols;
        const r = {x: col * filler.params.cellWidth - filler.params.cellWidth / 2 + col, y: row * filler.params.cellWidth - filler.params.cellWidth / 2 + row, width: filler.params.cellWidth, height: filler.params.cellWidth};
        return r;
    }

    if (!filler) return <Loader/>;
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
                {cells.map((c, i) => <rect key={i} onClick={cellClick} onMouseOver={mouseOver} onMouseOut={mouseOut} fillOpacity={getOpacity(c)} fill={c.fill} _id={c._id} {...coordinates(c, i)}/>)}
            </g>
        </svg>
    </div>
}
