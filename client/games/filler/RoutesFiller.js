import React from "react";
import Home from "client/main/home";
import Contacts from "client/main/contacts";
import Portfolio from "client/main/portfolio";
import HomeFiller from "client/games/filler/home-filler";

export default function RoutesFiller(props){

    return {
        "/": () => <HomeFiller {...props}/>,
    };
}
