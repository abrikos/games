import React, {useEffect, useState} from 'react';
import AccessDenied from "client/service/access-denied";
import {t} from "client/components/Translator"
import MyBreadCrumb from "client/components/MyBreadCrumb";
import {Button, Input} from "reactstrap";
import UserAvatar from "client/components/UserAvatar";

export default function Cabinet(props) {
    if (!props.authenticatedUser) return <AccessDenied/>;
    const [user, setUser] = useState({});
    const [avatar, setAvatar] = useState();
    const [nick, setNick] = useState();

    useEffect(()=>{
        loadUser()
    },[]);

    function loadUser() {
        props.api('/cabinet/user')
            .then(setUser)
    }

    function userSave(e) {
        e.preventDefault()
        props.api('/cabinet/user/save',props.formToObject(e.target))
            .then(setUser)
    }



    console.log(user)
    return <div>
        <MyBreadCrumb items={[
            {label: t('Cabinet')},
        ]}/>


        <div className="text-center"><UserAvatar user={user}/></div>
        <form onSubmit={userSave}>
        <div className="input-group mb-3">
            <Input placeholder="Avatar URL" defaultValue={user.photo_url} name="avatar" onChange={e=>setAvatar(e.target.value)}/>
        </div>

        <div className="input-group mb-3">
            <Input placeholder="Nickname" defaultValue={user.first_name} name="nick"/>
        </div>
        <Button className="input-group-text" id="basic-addon3">{t('Save')}</Button>
        </form>
        {avatar && <img src={avatar} alt="new image" style={{maxWidth:150, maxHeight:150}}/>}
    </div>

}

