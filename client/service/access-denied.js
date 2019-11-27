import React from 'react';
import {t} from "client/components/Translator";


const AccessDenied = () => {
    return <div>
        <h1>403 {t('Access denied')}</h1>
    </div>
};

export default AccessDenied;
