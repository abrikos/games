import React, {useEffect, useState} from "react";
import cellBgImages from "./images/cellBgImages";

export default function Cell(props) {
    const {updateField, cheater, mine, minesNear, ...rest} = props;
    const [status, setStatus] = useState('initial');
    const [flag, setFlag] = useState(false);

    function push(event) {
        updateField('push');
    }

    function release(event) {
        if (event.button) return updateField('flag');
        updateField('release')
    }


    function getClass() {
        if (props.cheater && props.mine && status !== 'this-mine') return 'cheater';
        if (props.status === 'checked' && props.mines > 0) return 'bomb-near';
        if (flag) return 'flag';
        return props.status;
    }

    function getImage() {
        if (props.mines >= 0) return props.mines;
        //if(flag) return 'flag';
        return props.status;
    }

    return <td
        onMouseUp={release}
        onMouseDown={push}
        className={'cell ' + getClass()}
        style={{
            backgroundImage: `url(${cellBgImages[getImage()]})`
        }}
        {...rest}
    />

}