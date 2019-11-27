import React from 'react';
import Intro from "client/views/intro";
import {t} from "client/components/Translator"

export default function Home(props) {
    if (!props.authenticatedUser) return <Intro {...props}/>;


    return <div>
        {t('Home')}
    </div>;
}




