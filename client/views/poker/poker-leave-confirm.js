import React from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {A, navigate} from "hookrouter";
import MyBreadCrumb from "client/components/MyBreadCrumb";

export default function PokerLeaveConfirm(props) {

    function leaveGame() {
        props.api(`/poker/${props.id}/leave`)
            .then(res => {
                navigate('/poker');
            })
    }

    return <div>
        <MyBreadCrumb items={[{href: '/' + props.game, label: props.game}, {label: t('Confirm leave game')}]}/>
        <h1>{t('Confirm to leave game')}</h1>

        <Button onClick={leaveGame} color={'warning'}>{t('Leave table')}</Button>
        <A href={`/poker/${props.id}`}>{t('Go back')}</A>
    </div>;
}




