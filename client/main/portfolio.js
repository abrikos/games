import React from 'react';
import {A, useRoutes} from "hookrouter";
import logo from "client/images/logo.png";
export default function Portfolio(props) {

    return <div className={'text-center'}>
        <h1>Портфолио</h1>
        <div><a href={"http://purchases.abrikos.pro/"}>Сервис управления списками закупок</a></div>
        <div><a href={"https://svg.abrikos.pro"}>Эксперименты с SVG</a></div>
        <div><a href={"https://minesweeper.abrikos.pro"}>Классическая игра "Сапер"</a></div>
        <div><a href={"https://minter-earth.pro"}>Гео визитки</a></div>
        <div><a href={"https://telegram.me/AbrikosLottery_bot"}>Бот крипто лотерей</a></div>
    </div>

}


