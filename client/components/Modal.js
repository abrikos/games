import React from "react";

export function Window(props) {
    return <div className="modal fade" id="settingsModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel4" aria-hidden="true">
        <div className="modal-dialog modal-dialog-slideout modal-lg" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">{props.title}</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div className="modal-body">
                    {props.content}

                </div>
                {/*<div className="modal-footer">
                        <Button className="btn-sm" data-dismiss="modal"></Button>

                    </div>*/}
            </div>
        </div>
    </div>
}

export function Button(props) {
    return <Button data-toggle="modal" data-target="#settingsModal" className={'btn-sm float-right'}>
        {props.label}
    </Button>
}
