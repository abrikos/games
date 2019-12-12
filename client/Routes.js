import React from "react";
import Home from "client/views/home/home";
import Login from "client/views/login";
import Cabinet from "client/views/cabinet";
import TablePlay from "client/views/table-play";
import TableStart from "client/views/table-start";

export default function Routes(props){

    return {
        "/": () => <Home {...props}/>,
        "/cabinet": () => <Cabinet {...props}/>,
        "/login": () => <Login {...props}/>,
        "/Dice": () => <TableStart game={'Dice'} {...props}/>,
        "/table/:id": (params) => <TablePlay {...params} {...props}/>,
        //"/filler": () => <HomeFiller {...props}/>,

        //"/filler/:id": (params) => <FillerField {...params}  {...props}/>,
        //"/black-jack": (params) => <BJStart {...params}  {...props}/>,
        //"/black-jack/:id": (params) => <BJStart {...params}  {...props}/>,
    };
}
