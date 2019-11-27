import React, {useState} from "react";
import LayoutMain from "client/main/LayoutMain";
import sites from "client/sites";
import url from "url";
import LayoutMS from "client/games/minesweeper/LayoutMS";
import API from "client/API";
import LayoutSvg from "client/games/svg/LayoutSvg";
import LayoutFiller from "client/games/filler/LayoutFiller";


export default function App() {
    const [alert, setAlert] = useState({isOpen: false});
    const params = {
        alert,
        setAlert: (response) => {
            const color = response.error ? 'danger' : 'success';
           setAlert({isOpen: true, children: response.message, color})
        },

        clearAlert: () => {
            setAlert({isOpen:false})
        },

        async apiData(path, data) {
            const res = await API.postData(path, data)
            if (res.error) {
                this.setAlert(res);
            } else {
                this.clearAlert();
            }
            return res;
        },
    };
    const site = sites[url.parse(window.location.href).host];
    return (
        <div className="App">
            {site==='main' && <LayoutMain {...params}/>}
            {site==='minesweeper' && <LayoutMS {...params}/>}
            {site==='svg' && <LayoutSvg {...params}/>}
            {site==='filler' && <LayoutFiller {...params}/>}
        </div>
    );
}
