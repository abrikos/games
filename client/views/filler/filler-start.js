import React, {useEffect, useState} from "react";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import {A,navigate} from "hookrouter";
import AcceptFiller from "client/views/filler/AcceptFiller";

export default function FillerStart(props) {

    const [fillers, setFillers] = useState([]);

    useEffect(()=>{
        props.api('/filler/available')
            .then(setFillers)
    },[]);

    function fillerCreate() {
        props.api('/filler/create')
            .then(filler=>{
                //console.log(filler)
                navigate(`/filler/${filler.id}`)
            })
    }




    return <div>
        <Button onClick={fillerCreate}>{t('Create filler')}</Button>
        {fillers.map(f=><div key={f.id}>
            <A href={`/filler/${f.id}`}>{f.player.first_name}</A>
            {f.date}
            {props.authenticatedUser.id !== f.player.id && <AcceptFiller filler={f} {...props}/>}
        </div>)}
    </div>
}
