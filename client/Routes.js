import React from "react";
import Home from "client/views/home/home";
import Login from "client/views/login";
import Cabinet from "client/views/cabinet";
import PokerList from "client/poker/poker-list";
import PokerLeaveConfirm from "client/poker/poker-leave-confirm";
import PokerPlay from "client/poker/poker-play";
import PokerTest from "client/poker/PokerTest";
import PokerSvg from "client/poker/poker-svg";

export default function Routes(props){

    return {
        "/": () => <Home {...props}/>,
        "/cabinet": () => <Cabinet {...props}/>,
        "/login": () => <Login {...props}/>,
        "/poker": () => <PokerList {...props}/>,
        "/poker/test": () => <PokerTest {...props}/>,
        "/poker/svg": () => <PokerSvg {...props}/>,
        "/poker/:id": (params) => <PokerSvg {...params} {...props}/>,
        "/poker/:id/leave": (params) => <PokerLeaveConfirm {...params} {...props}/>,
        //"/filler": () => <HomeFiller {...props}/>,

        //"/filler/:id": (params) => <FillerField {...params}  {...props}/>,
        //"/black-jack": (params) => <BJStart {...params}  {...props}/>,
        //"/black-jack/:id": (params) => <BJStart {...params}  {...props}/>,
    };
}
