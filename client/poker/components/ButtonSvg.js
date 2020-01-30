import React, {useState} from 'react';
import PropTypes from "prop-types";
import configSvg from "../config-svg";
import {t} from "client/components/Translator";
const padding = 10;



export default function ButtonSvg(props) {
    return <svg {...props}>
        <g className="button" onClick={props.onClick}>
            <rect fill={'gray'} width={props.width} height={props.height || configSvg.fontSize + padding * 2} />
            <text y={configSvg.fontSize + padding} x={props.width / 2} fill="#FFFFFF" fontSize={configSvg.fontSize} textAnchor="middle">
                {props.text}
            </text>

        </g>

    </svg>
}


ButtonSvg.propTypes = {
    text: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
};


