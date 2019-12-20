import React from "react";



export default function SliderSvg(props) {
    const [coordinates, setCoordinates] =React.useState( {cx:20, cy:110});
    const [clickPosition, setClickPosition] =React.useState( {x:0, y:0});
    const [dragged, setDragged] =React.useState( false);

    function down(e) {
        setDragged(true);
        console.log({x:e.clientX, y:e.clientY})
        setClickPosition({x:e.clientX, y:e.clientY})
    }

    function drag(e) {
        if(dragged) console.log(e.pageX, e.movementX, e);
        coordinates.cy += clickPosition.x -e.clientX;
        //console.log(coordinates, clickPosition.x, e.clientX)
        setCoordinates(coordinates)
    }

    function up(e) {
        setDragged(false)
    }

    return <svg
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect x={15} width={10} height={200} fill={"#999999"} />
        <circle {...coordinates} r={20} fill={"#FF0000"} onMouseDown={down} onMouseMove={drag} onMouseUp={up}/>
        <text y={50}>{JSON.stringify(clickPosition)}</text>
    </svg>
}
