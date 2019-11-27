import React, {useEffect, useReducer, useState} from "react";
import Cell from "./Cell";
import {Button, ButtonGroup} from "reactstrap";
import {t} from "client/Translator";
import Timer from "./timer";
import * as Images from "./images";
import config from "./config";
import './minesweeper.css';
import Loader from "client/components/Loader";

export default function Table(props) {
    const lev = 0;
    const initField = {cells: initCells(config.levels[lev]), level: config.levels[lev]};

    const [smileImage, setSmile] = useState('Norm');
    const [timerOn, toggleTimer] = useState(false);
    const [resetTimer, timerReset] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [minesLeft, setMinesLeft] = useState(0);
    const [field, updateField] = useReducer(reducer, initField);

    useEffect(() => {
        console.log('RIGHT CLICK')
        document.addEventListener('contextmenu', e => e.preventDefault());
    }, []);


    function initCells(level) {
        const array = [];
        for (let index = 0; index < level.rows * level.cols; index++) {
            const {row, col} = getCoordinate(level, index);
            array.push({index, status: 'initial', minesNear: -1, cheater: config.cheater, mine: false, row, col})
        }
        return array;
    }



    function reducer(field, updateFieldArgs) {
        const {cell, result, levelIndex} = updateFieldArgs;
        if (result === 'restart') {
            timerReset(true);
            toggleTimer(false);
            if (levelIndex >= 0) field.level = config.levels[levelIndex];
            field.cells = initCells(field.level);
            setSmile('Norm');
            setPlaying(true)
        }
        if (!playing) return field;
        switch (result) {
            case 'push':
                setSmile('Wow');
                break;
            case 'release':
                setSmile('Norm');
                //FIRST CELL
                if (!timerOn) {
                    timerReset(false);
                    toggleTimer(true);
                    placeMines(field, cell);
                }
                if (cell.status === 'flag') break;
                //GAME oVER
                if (cell.mine) {
                    field.cells.filter(c => c.mine).map(c => c.status = 'bomb');
                    field.cells[cell.index].status = 'this-mine';
                    timerReset(false);
                    toggleTimer(false);
                    setSmile('Death');
                    setPlaying(false)
                    break;
                }

                calcNearMines(field, cell);
                let initial = field.cells.filter(c => c.status === 'initial');
                //WIN
                if (initial.length === field.level.mines) {
                    setSmile('Win');
                    toggleTimer(false);
                    field.cells.filter(c => c.mine).map(c => c.status = 'flag');
                    setPlaying(false)
                }
                break;
            case 'flag':
                setSmile('Norm');
                const flags = field.cells.filter(c => c.status === 'flag').length;
                if (field.level.mines - flags <= 0) break;
                field.cells[cell.index].status = 'flag';
                setMinesLeft(field.level.mines - flags - 1);
        }
        return field
    }

    function getCoordinate(level, index) {
        let row = Math.floor(index / level.cols);
        let col = index % level.cols;
        return {row, col}
    }

    function getIndex(cells, {row, col}) {
        const cell = cells.find(c => c.row === row && c.col === col);
        if (!cell) return -1;
        return cell.index;
    }

    function calcNearMines(field, cell) {
        cell.mines = countMines(field, cell);
        cell.status = 'checked';
        if (cell.mines > 0) {
            return;
        }
        const beChecked = [0, 1, 2, 3, 5, 6, 7, 8]
        for (const i of beChecked) {
            let row = Math.floor(i / 3);
            let col = i % 3;
            const index = getIndex(field.cells, {row: cell.row - 1 + row, col: cell.col - 1 + col});
            let test = field.cells[index];
            if (test && cell.index !== test.index && test.status === 'initial') {
                //test.status = test.mines ? 'mines' : 'empty'
                calcNearMines(field, test);
            }
        }
    }

    function countMines(field, cell) {
        let bombsFound = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (!j && !i) continue;
                const index = getIndex(field.cells, {col: cell.col + i, row: cell.row + j});
                let test = field.cells[index];
                if (test && test.mine) {
                    bombsFound++;
                }
            }
        }
        return bombsFound;
    }

    function placeMines(field, cell) {
        let mines = field.cells.filter(c => cell.index !== c.index);
        mines.sort(function () {
            return 0.5 - Math.random()
        });
        mines = mines.slice(0, field.level.mines);
        //FIXED MINES
        if(0) {
            const placed = [1, 7, 10, 12, 15, 17, 20, 25, 29, 40];
            mines = [];
            for (const index of placed) mines.push({index});
        }
        for (const m of mines) {
            field.cells[m.index].mine = true;
        }
    }

    function chooseLevel(level) {

    }

    function calcState(cell) {
        return cell.status;
    }

    const rows = [];
    let cols = [];
    let r = 0;

    for (let cell of field.cells) {
        let row = Math.floor(cell.index / field.level.cols);
        if (row !== r) {
            r = row;
            rows.push(<tr key={row} children={cols}/>);
            cols = []
        }
        cols.push(<Cell key={cell.index} status={calcState(cell)} updateField={result => updateField({result, cell})} {...cell}/>);
    }
    rows.push(<tr key={r + 1} children={cols}/>);

    return <div className="admin-profile text-center">
        <div>
            <ButtonGroup>
                <Button onMouseDown={() => updateField({result: 'push'})} onMouseUp={() => updateField({result: 'restart', levelIndex: 0})} color='primary'>{t('Level')} 1</Button>
                <Button onMouseDown={() => updateField({result: 'push'})} onMouseUp={() => updateField({result: 'restart', levelIndex: 1})} color='secondary'>{t('Level')} 2</Button>
                <Button onMouseDown={() => updateField({result: 'push'})} onMouseUp={() => updateField({result: 'restart', levelIndex: 2})} color='warning'>{t('Level')} 3</Button>
            </ButtonGroup>
        </div>
        <table border="1" className='minesweeper m-auto'>
            <tbody>
            <tr>
                <td>
                    <table width="100%" border="1">
                        <tbody>
                        <tr>
                            <td width="40%" className='digital'><Timer on={timerOn} reset={resetTimer}/></td>
                            <td className='text-center'>
                                <img
                                    src={Images[`smile${smileImage}`]}
                                    onMouseDown={() => updateField({result: 'push'})}
                                    onMouseUp={() => updateField({result: 'restart'})}
                                />
                            </td>
                            <td width="40%" className='digital'>{minesLeft}</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table className={'board'}>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                    <div>{t('Field size')}: {field.level.rows}x{field.level.cols}</div>
                    <div>{t('Mines')}: {field.level.mines}</div>
                </td>
            </tr>
            </tbody>
        </table>

    </div>;
}

