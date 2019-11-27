import React from 'react';
import {t} from "client/components/Translator";
import TelegramLogin from "client/components/TelegramLogin";

export default function Login(props) {
    return <div>
        <div className={'d-flex justify-content-center'}>
            <div className={'card'}>
                <div className={'card-header'}>{t('Log in')}</div>
                <div className={'card-body'}>

                    {/*<Button onClick={() => props.logIn('test')}>Test</Button>*/}

                    <TelegramLogin {...props}/>

                    {/*<GoogleLogin
                        clientId="986859169011-5ia10srbpfgt71ig1sh33aiv3l961un3.apps.googleusercontent.com"
                        buttonText="Login"
                        onSuccess={responseGoogle}
                        onFailure={responseGoogle}
                        cookiePolicy={'single_host_origin'}
                    />*/}
                </div>

            </div>
        </div>


    </div>


}


