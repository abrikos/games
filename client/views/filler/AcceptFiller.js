import {t} from "client/components/Translator";
import {Button} from "reactstrap";
import React from "react";
import {navigate} from "hookrouter";

export default function AcceptFilter(props) {
    function acceptGame() {
        props.api('/filler/accept/'+props.filler.id)
            .then(filler=>{
                navigate(`/filler/${filler.id}`)
            })
    }
return <Button onClick={()=>acceptGame()}>{t('Accept game')}</Button>
}
