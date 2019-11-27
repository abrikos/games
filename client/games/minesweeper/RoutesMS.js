import React from "react";
import Contacts from "client/main/contacts";
import Table from "client/games/minesweeper/Table";

export default function RoutesMain(props){
    return {
        "/": () => <Table {...props}/>,
        "/contacts": () => <Contacts {...props}/>
    };
}
