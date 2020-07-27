import ReactDOM from "react-dom";
import React from "react";

import translate from "./i18n.js";

export function element(puffin, Component) {
    function mounted() {
        ReactDOM.render(<Component />, this);
    }
    return puffin.element`<div mounted="${mounted}" />`;
}

export default function open({ Dialog, StaticConfig, puffin }) {
    const dialog = new Dialog({
        title: translate("dialogTitle", StaticConfig.data.appLanguage),
        component: () => {
            class Component extends React.Component {
                render() {
                    return (<div>
                        Content of the dialog
                    </div>);
                }
            }

            return element(puffin, Component);
        }
    });
    dialog.launch();
}