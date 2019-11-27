import React, {useEffect} from "react";

export default function TelegramLogin(props) {
    const id = 'TelegramLoginButton';

    useEffect(() => {


        props.api('/site-info')
            .then(res => {
                console.log(res)
                const script = document.createElement('script');
                //script.src = 'https://telegram.org/js/telegram-widget.js?2';
                script.src = 'https://tg.dev/js/telegram-widget.js?3';
                script.setAttribute('data-telegram-login', res.botName);
                script.setAttribute('data-size', 'medium');
                script.setAttribute('data-request-access', 'write');
                //script.setAttribute('data-userpic', true);
                //script.setAttribute('data-onauth', `telegramAuth(user)`);
                script.setAttribute('data-auth-url', `${res.site}/api/login/telegram`);
                script.async = true;
                const container = document.getElementById(id)
                container && container.appendChild(script);
            })

    }, []);

    return <div id={id}>

    </div>
}
