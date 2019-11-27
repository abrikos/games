import React, {useEffect, useState} from 'react';
import AccessDenied from "client/service/access-denied";
import {t} from "client/components/Translator"
import MyBreadCrumb from "client/components/MyBreadCrumb";
import {A} from "hookrouter";
import {Nav, NavItem} from "reactstrap";

export default function Cabinet(props) {
    if (!props.authenticatedUser) return <AccessDenied/>;
    const [fillers, setFillers] = useState();

    useEffect(() => {
        props.api('/filler/user/list')
            .then(u => setFillers(u))
    }, []);

    return <div>
        <MyBreadCrumb items={[
            {label: t('Cabinet')},
        ]}/>

        {fillers && <div>
            <h2>{t('Filler')}</h2>
            <h4>{t('My')}</h4>
            {fillers.my.map(f=><div key={f.id}><A href={`/filler/${f.id}`}>{f.player.name} {f.opponent ? 'vs ' + f.opponent.name : ''}</A></div>)}
            <h4>{t('Accepted')}</h4>
            {fillers.accepted.map(f=><div key={f.id}><A href={`/filler/${f.id}`}>{f.player.name} vs {f.opponent.name}</A></div>)}
        </div>}
    </div>

}

