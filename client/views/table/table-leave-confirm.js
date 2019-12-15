import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {A, navigate} from "hookrouter";
import Loader from "client/components/Loader";
import MyBreadCrumb from "client/components/MyBreadCrumb";

export default function TableLeaveConfirm(props) {

    function leaveGame() {
        props.api(`/table/${props.id}/leave`)
            .then(res => {
                navigate('/' + props.game);
            })
    }

    return <div>
        <MyBreadCrumb items={[{href: '/' + props.game, label: props.game}, {label: t('Confirm leave game')}]}/>
        <h1>{t('Confirm to leave game')}</h1>

        <Button onClick={leaveGame} color={'warning'}>{t('Leave table')}</Button>
        <A href={`/table/${props.id}`}>{t('Go back')}</A>
    </div>;
}




