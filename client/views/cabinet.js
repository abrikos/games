import React, {useEffect, useState} from 'react';
import AccessDenied from "client/service/access-denied";
import {t} from "client/components/Translator"
import MyBreadCrumb from "client/components/MyBreadCrumb";
import {Button, Input} from "reactstrap";
import UserAvatar from "client/components/UserAvatar";

export default function Cabinet(props) {
    if (!props.authenticatedUser) return <AccessDenied/>;
    const [user, setUser] = useState({});
    const [avatar, setAvatar] = useState(props.authenticatedUser.photo_url);

    useEffect(()=>{
        loadUser()
    },[]);

    function loadUser() {
        props.api('/cabinet/user')
            .then(setUser)
    }

    function avatarSave() {
        props.api('/cabinet/avatar/save',{avatar})
            .then(setUser)
    }

    return <div>
        <MyBreadCrumb items={[
            {label: t('Cabinet')},
        ]}/>


        <div className="text-center"><UserAvatar user={user}/></div>

        <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder="Avatar URL" aria-label="Имя получателя" aria-describedby="basic-addon2" defaultValue={user.photo_url} onChange={e=>setAvatar(e.target.value)}/>
                <div className="input-group-append">
                    <Button onClick={avatarSave} className="input-group-text" id="basic-addon2">{t('Change avatar')}</Button>
                </div>
        </div>
        {avatar!==props.authenticatedUser.photo_url && <img src={avatar} alt="new image" style={{maxWidth:150, maxHeight:150}}/>}
    </div>

}

