import React from 'react';
import {t} from "client/components/Translator";

export default function ServerError (props) {
    return <div>
        <h1>500 {t('Server error')}</h1>
        {JSON.stringify(props)}
    </div>
};


