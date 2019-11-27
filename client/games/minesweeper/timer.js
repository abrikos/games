import {useEffect, useState} from "react";

export default function Timer(props) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if(props.reset) setSeconds(0)
        let interval = null;
        if (props.on) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else {

            if(seconds !== 0) clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [props.on, props.reset, seconds]);
    return seconds;
}