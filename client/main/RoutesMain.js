import React from "react";
import Home from "client/main/home";
import Contacts from "client/main/contacts";
import Portfolio from "client/main/portfolio";

export default function RoutesMain(props){

    return {
        "/": () => <Home {...props}/>,
        "/portfolio": () => <Portfolio {...props}/>,
        "/contacts": () => <Contacts {...props}/>
    };
}
