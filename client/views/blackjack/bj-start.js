import React from 'react';
import * as Cards from "./cards/index"

import {t} from "client/components/Translator"
import {isMoment} from "moment";

console.log(Cards)

export default function BJStart(props) {
    const suits=['S','C','D','H'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

    function rand() {
        const suit = suits
    }
    return <div>

        {suits.map(c=>values.map(n=><img key={c+n} src={Cards[c+n]}/>
            ))}
    </div>;
}




