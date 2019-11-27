import React from "react";
import PropTypes from "prop-types";

export default function InputSelect(props) {

    return <select onChange={e=>props.onChange(e.target.value)} className="form-control" defaultValue={props.defaultValue}>
        {props.options.map((item,i)=>{
            if(item.options){
                return <optgroup key={i} label={item.label} className={item.className || ''}> {item.options.map((item2,i2)=><option key={i2} value={item2.value}>{item2.label}</option>)}</optgroup>
            }else{
                return <option key={i} value={item.value}>{item.label}</option>
            }
        })}
    </select>
}

InputSelect.propTypes = {
    options: PropTypes.array.isRequired,
    default: PropTypes.string
};

