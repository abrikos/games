import React from "react";
import Home from "client/views/home/home";
import Login from "client/views/login";
import Cabinet from "client/views/cabinet";
import PokerList from "client/views/poker/poker-list";
import PokerLeaveConfirm from "client/views/poker/poker-leave-confirm";
import PokerPlay from "client/views/poker/poker-play";
import PokerTest from "client/views/poker/PokerTest";

export default function Routes(props){

    return {
        "/": () => <Home {...props}/>,
        "/cabinet": () => <Cabinet {...props}/>,
        "/login": () => <Login {...props}/>,
        "/poker": () => <PokerList {...props}/>,
        "/poker/test": () => <PokerTest {...props}/>,
        "/poker/:id": (params) => <PokerPlay {...params} {...props}/>,
        "/poker/:id/leave": (params) => <PokerLeaveConfirm {...params} {...props}/>,
        //"/filler": () => <HomeFiller {...props}/>,

        //"/filler/:id": (params) => <FillerField {...params}  {...props}/>,
        //"/black-jack": (params) => <BJStart {...params}  {...props}/>,
        //"/black-jack/:id": (params) => <BJStart {...params}  {...props}/>,
    };
}
