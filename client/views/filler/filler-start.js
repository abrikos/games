import React, {useEffect, useState} from "react";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import {A, navigate} from "hookrouter";
import AcceptFiller from "client/views/filler/AcceptFiller";

export default function FillerStart(props) {

    const [fillers, setFillers] = useState([]);
    const [levels, setLevels] = useState([]);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        props.api('/filler/available')
            .then(setFillers)
        props.api('/filler/levels')
            .then(setLevels)
    }, []);

    function fillerCreate() {
        props.api('/filler/create/' + level)
            .then(filler => {
                //console.log(filler)
                navigate(`/filler/${filler.id}`)
            })
    }

    function chooseLevel(e) {
        setLevel(e.target.value*1)
    }

    return <div>
        {level}
        <fieldset id="group2" onChange={chooseLevel}>
            {levels.map((l,i)=><div key={i}>
                <input type="radio" value={i} name="level" checked={i===level}/>{' '}
                {l.rows}x{l.cols}{' '}
                {l.colors.map((c,j)=><span key={j} style={{backgroundColor:c}}>&nbsp;</span>)}
            </div>)}
        </fieldset>
        <Button onClick={fillerCreate} color={'primary'}>{t('Create filler')}</Button>
        <hr/>
        {fillers.map(f => <div key={f.id}>
            <A href={`/filler/${f.id}`}>{f.player.first_name}</A>
            {f.date}
            {props.authenticatedUser.id !== f.player.id && <AcceptFiller filler={f} {...props}/>}
        </div>)}
    </div>
}
