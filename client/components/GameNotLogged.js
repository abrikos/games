import React from "react";
import PropTypes from "prop-types";
import {t} from "client/components/Translator";
import TelegramLogin from "client/components/TelegramLogin";

export default function GameNotLogged(props) {

    return <div><h1>{props.game}</h1>{t('To play this game please log in')} <TelegramLogin {...props}/></div>
}

GameNotLogged.propTypes = {
    game: PropTypes.string.isRequired,
};

