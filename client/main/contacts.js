import React from "react";

export default function Contacts() {
    const contacts = [
        {link:'mailto:me@abrikos.pro', label: 'E-mail'},
        {link:'https:/t.me/abrikostrator', label: 'Telegram'},
        {link:'https:www.abrikos.pro', label: 'Домашняя страница'},
    ]
    return <div>
        <dl>
            {contacts.map((c,i)=><div key={i}>
                <dt>{c.label}</dt>
                <dd><a href={c.link}>{c.link}</a></dd>
            </div>)}
        </dl>
    </div>

}