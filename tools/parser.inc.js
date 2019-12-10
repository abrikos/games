import * as axios from "axios";
import {parse} from "node-html-parser";
const fckngsht = ["", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
export default {
    site: 'http://iltumen.ru',
    convertDate: (dateString) => {
        const dateMatch = dateString.match(/Опубликовано: (.*) (.*), (.*) - (.*)/);
        const fck2 = fckngsht.indexOf(dateMatch[2])
        return `${dateMatch[3]}-${fck2 < 10 ? '0' + fck2 : fck2}-${dateMatch[1] < 10 ? '0' + dateMatch[1] : dateMatch[1]} ${dateMatch[4]}`;
    },

    convertDateShort: (dateString) => {
        const dateMatch = dateString.match(/(.*) (.*) (.*), (.*)/);
        const fck2 = fckngsht.indexOf(dateMatch[2])
        return `${dateMatch[3]}-${fck2 < 10 ? '0' + fck2 : fck2}-${dateMatch[1]} ${dateMatch[4]}`;
    },

    getDom: async (url) => {
        const response = await axios.get(url);
        return parse(response.data);
    },

    adapt:(text)=>{
        return text.replace(/'/g,'&#39');
    }

}
