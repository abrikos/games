import React from "react";
import PropTypes from "prop-types";

export default function InputSelect(props) {
    const params = {className: "form-control", defaultValue: props.defaultValue, name: props.name};
    if (props.onChange) params.onChange = e => props.onChange(e.target.value);
    if (props.type === "radio") {
        return props.options.map((item, i) => <div className="form-check" key={i}><label className="form-check-label">
                <input type="radio" name={props.name} autoComplete="off" className="form-check-input"/> {item.label}
        </label></div>)

    } else {
        return <select {...params}>
            {props.options.map((item, i) => {
                if (item.options) {
                    return <optgroup key={i} label={item.label} className={item.className || ''}> {item.options.map((item2, i2) => <option key={i2} value={item2.value}>{item2.label}</option>)}</optgroup>
                } else {
                    return <option key={i} value={item.value}>{item.label}</option>
                }
            })}
        </select>
    }

}

InputSelect.propTypes = {
    options: PropTypes.array.isRequired,
    defaultValue: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func
};

