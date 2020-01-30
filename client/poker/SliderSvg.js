import React from "react";



export default function SliderSvg(props) {
    const [coordinates, setCoordinates] =React.useState( {cx:20, cy:110});
    const [clickPosition, setClickPosition] =React.useState( {x:0, y:0});
    const [dragging, setDragging] =React.useState( false);
    const [origin, setOrigin] = React.useState({ x: 0, y: 0 });

    function down(e) {
        setDragging(true);
        console.log("DOWN",{x:e.clientX, y:e.clientY})
        //setClickPosition({x:e.clientX, y:e.clientY})
    }

    function drag(e) {
        if(!dragging) return;
        const c ={cx:coordinates.cx};
        c.cy = e.pageY;
        console.log(c, e.clientY, e.pageY, e.movementY)
        setCoordinates(c)
    }

    function up(e) {
        console.log("UP",{x:e.clientX, y:e.clientY})
        setDragging(false)
    }



    return <svg
        xmlns="http://www.w3.org/2000/svg"
        {...props}

    >
        <g onMouseDown={down} onMouseMove={drag} onMouseUp={up}>
        <rect x={15} width={10} height={600} fill={"#999999"} />
        <circle {...coordinates} r={20} fill={"#FF0000"} />
        <text x={-50} y={50}>{JSON.stringify(coordinates)}</text>
        </g>
    </svg>
}
