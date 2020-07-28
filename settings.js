import translate from "./i18n.js";
import ReactDOM from "react-dom";
import React from "react";

export function element(puffin, Component) {
    function mounted() {
        ReactDOM.render(<Component />, this);
    }
    return puffin.element`<div mounted="${mounted}" />`;
}

export class Settings {
    constructor(StaticConfig) {
        this.StaticConfig = StaticConfig;
    }

    create() {
        const defaultConfig = {
            currentFileTime: false,
            details: "Editing {currentfile}",
            state: "Workspace: {workspace}",
            imageText: "Editing a {filetype} file"
        };
        if (!this.StaticConfig.data.GravitonRPC)
            this.StaticConfig.data.GravitonRPC = defaultConfig;
        else if (typeof this.StaticConfig.data.GravitonRPC === "object"
            && Object.keys(defaultConfig)
                .some((k) => !Object.keys(this.StaticConfig.data.GravitonRPC).includes(k)))
            this.StaticConfig.data.GravitonRPC = Object.assign(defaultConfig, this.StaticConfig.data.GravitonRPC);
        else if (typeof this.StaticConfig.data.GravitonRPC !== "object")
            this.StaticConfig.data.GravitonRPC = defaultConfig;
    }

    all() {
        this.create();
        const that = this;
        return {
            ...this.StaticConfig.data.GravitonRPC,
            save: function () {
                const config = Object.assign({}, this);
                delete config.save;
                that.StaticConfig.data.GravitonRPC = this;
            }
        };
    }

    get(key) {
        this.create();
        return this.StaticConfig.data.GravitonRPC[key];
    }

    set(key, value) {
        this.create();
        const config = Object.assign({}, this.StaticConfig.data.GravitonRPC);
        config[key] = value;
        this.StaticConfig.data.GravitonRPC = config;
    }
}

export function parseText(text, { editingFile, workingProject, file, instance }) {
    return typeof text === "string"
        ? text
            .replace(/{currentfile}/gi, editingFile)
            .replace(/{workspace}/gi, workingProject)
            .replace(/{filetype}/gi, file)
            .replace(/{totallines}/gi, instance.options.value.split("\n").length)
        : text;
}

export function open({ Dialog, StaticConfig, puffin }) {
    const language = StaticConfig.data.appLanguage;
    const settings = new Settings(StaticConfig);
    const previewStyle = puffin.style`
        & {
            height: 30%;
            display: flex;
            padding: 8px 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            align-items: center;
            background-color: #7289da;
        }

        & > img {
            width: 80px;
            height: 80px;
            padding-right: 14px;
        }

        & > div {
            display: flex;
            flex-direction: column;
        }

        & > div > p {
            margin: 0;
            color: #ffffff;
        }
    `;
    const checkboxStyle = puffin.style`
        & {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        & > div {
            width: 25px;
            height: 25px;
            transition: 0.2s;
            margin-right: 5px;
            border-radius: 2px;
            background-color: var(--inputBorder);
        }
    `;
    const checkedBoxStyle = puffin.style`
        & {
            background-color: var(--puffinAccent, var(--accentColor)) !important;
        }

        &::before {
            width: 8px;
            content: "";
            height: 14px;
            margin: 2px 7px;
            transition: 0.2s;
            position: absolute;
            border-style: solid;
            transform: rotate(45deg);
            border-width: 0 2px 2px 0;
            border-color: #ffffff;
        }
    `;
    const dialog = new Dialog({
        title: translate("dialogTitle", language),
        width: "450px",
        height: "350px",
        component: () => {
            class Component extends React.Component {
                constructor(props) {
                    super(props);

                    this.state = {
                        time: 0,
                        editing: ""
                    };

                    this.detailsRef = React.createRef();
                    this.stateRef = React.createRef();
                }

                componentDidMount() {
                    setInterval(() => {
                        this.setState({
                            time: this.state.time + 1000
                        })
                    }, 1000);
                }

                parseTime(milliseconds) {
                    const timeObj = {
                        hours: Math.floor(milliseconds / 3600000) % 24,
                        minutes: Math.floor(milliseconds / 60000) % 60,
                        seconds: Math.floor(milliseconds / 1000) % 60
                    };

                    return [
                        timeObj.hours ? `${String(timeObj.hours).length < 2 ? "0" : ""}${timeObj.hours}` : "00",
                        timeObj.minutes ? `${String(timeObj.minutes).length < 2 ? "0" : ""}${timeObj.minutes}` : "00",
                        timeObj.seconds ? `${String(timeObj.seconds).length < 2 ? "0" : ""}${timeObj.seconds}` : "00"
                    ].join(":");
                }

                change(key, value) {
                    settings.set(key, value);
                    this.setState({});
                }

                setEditing(value) {
                    this.setState({
                        editing: value
                    });
                }

                exitEditing(event) {
                    if (this.state.editing && this[`${this.state.editing}Ref`].current) {
                        const element = this[`${this.state.editing}Ref`].current;
                        if (event && element.contains(event.target)) return;
                        if (element instanceof HTMLInputElement)
                            settings.set(this.state.editing, element.value);
                    }

                    this.setState({
                        editing: ""
                    });
                }

                renderLine(value, ref) {
                    const text = parseText(settings.get(value), {
                        editingFile: "test.js",
                        workingProject: "test",
                        file: "javascript",
                        instance: {
                            options: {
                                value: ""
                            }
                        }
                    });
                    return (this.state.editing === value
                        ? <input
                            type="text"
                            defaultValue={settings.get(value)}
                            onKeyPress={(e) => e.which === 13 ? this.exitEditing(null, true) : null}
                            ref={ref} />
                        : <p onDoubleClick={() => this.setEditing(value)} ref={ref}>{text}</p>);
                }

                render() {
                    return (<>
                        <div className={previewStyle} onClick={(e) => this.exitEditing(e)}>
                            <img src="https://raw.githubusercontent.com/Graviton-Code-Editor/Graviton-App/master/assets/logo.svg" />
                            <div>
                                <p style={{ fontWeight: "bold" }}>Graviton Editor</p>
                                {this.renderLine("details", this.detailsRef)}
                                {this.renderLine("state", this.stateRef)}
                                <p>{translate("elapsed", language, this.parseTime(this.state.time))}</p>
                            </div>
                        </div>
                        <div className={checkboxStyle}>
                            <div
                                className={settings.get("currentFileTime") ? checkedBoxStyle : undefined}
                                onClick={() => this.change("currentFileTime", !settings.get("currentFileTime"))} />
                            {translate("currentFileTime", language)}
                        </div>
                        <small>{translate("clickEdit", language)}</small>
                        <br />
                        <small>{translate("variables", language)}
                            <ul style={{ margin: "0", marginTop: "4px" }}>
                                <li>{"{currentfile}"}</li>
                                <li>{"{workspace}"}</li>
                                <li>{"{filetype}"}</li>
                                <li>{"{totallines}"}</li>
                            </ul>
                        </small>
                    </>);
                }
            }

            return element(puffin, Component);
        }
    });
    dialog.launch();
}   