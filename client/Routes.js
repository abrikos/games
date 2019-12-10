import React from "react";
import Home from "client/views/home/home";
import Login from "client/views/login";
import HomeFiller from "client/views/filler/filler-start";
import FillerField from "client/views/filler/filler-field";
import Cabinet from "client/views/cabinet";
import BJStart from "client/views/blackjack/bj-start";

export default function Routes(props){

    return {
        "/": () => <Home {...props}/>,
        "/cabinet": () => <Cabinet {...props}/>,
        "/login": () => <Login {...props}/>,
        "/filler": () => <HomeFiller {...props}/>,
        "/filler/:id": (params) => <FillerField {...params}  {...props}/>,
        "/black-jack": (params) => <BJStart {...params}  {...props}/>,
        "/black-jack/:id": (params) => <BJStart {...params}  {...props}/>,
    };
}
