import * as settings from "./settings.js";
import DiscordRPC from "discord-rpc";
import translate from "./i18n.js";

const supportedFiles = ["c", "cpp", "css", "git", "html", "javascript", "json", "jsx", "md", "python", "svelte", "txt", "typescript", "vue"];
const rpc = new DiscordRPC.Client({ transport: "ipc" });
const clientId = "720362061053558805";
const path = window.require("path");
const timestamp = Date.now();

let barItem;
let currentTab;
let barItemAction = () => null;

const defaultPresence = {
    largeImageKey: "applogo",
    largeImageText: "Graviton Editor",
    startTimestamp: timestamp,
    instance: false
};

export const entry = (API) => {
    const { RunningConfig, StatusBarItem, StaticConfig } = API;
    if (RunningConfig.data.isDev) return;
    const config = new settings.Settings(StaticConfig);
    config.create();
    barItem = patchItem(new StatusBarItem({
        label: "",
        action: () => barItemAction()
    }));
    barItem.hide();
    rpc.login({ clientId }).catch((e) => onError(StaticConfig.data.appLanguage, API, e));
    rpc.on("connected", () => {
        onConnected(StaticConfig.data.appLanguage, API);
        rpc.setActivity({ ...defaultPresence });
    });

    RunningConfig.on("aTabHasBeenFocused", ({ client, instance, parentFolder, directory, tabElement }) => {
        if (client) {
            const editingFile = path.basename(path.normalize(directory));
            const workingProject = path.basename(path.normalize(parentFolder));
            var file = client.do("getMode", { instance }).name;
            switch (file) {
                case "application/json":
                    file = "json";
                    break;
                case "gfm":
                    file = "md";
                    break;
                case "htmlmixed":
                    file = "html";
                    break;
                case "text/typescript":
                    file = "typescript";
                    break;
                case "gitignore":
                    file = "git";
                    break;
                case "text/x-vue":
                    if (editingFile.endsWith(".svelte")) file = "svelte";
                    if (editingFile.endsWith(".vue")) file = "vue";
                    break;
                case "text/x-c++src":
                    file = "cpp";
                    break;
                case "text/x-csrc":
                    file = "c";
                    break;
                case "text/jsx":
                    file = "javascript";
                    break;
            }
            rpc.setActivity({
                ...defaultPresence,
                details: settings.parseText(config.get("details"), { editingFile, workingProject, file, instance }),
                state: settings.parseText(config.get("state"), { editingFile, workingProject, file, instance }),
                largeImageKey: supportedFiles.includes(file) ? file : "txt",
                largeImageText: settings.parseText(config.get("imageText"), { editingFile, workingProject, file, instance }),
                smallImageKey: "applogo",
                smallImageText: "Graviton",
                startTimestamp: config.get("currentFileTime") ? Date.now() : timestamp
            });
            currentTab = tabElement;
        }
    });

    RunningConfig.on("aTabHasBeenClosed", ({ client, tabElement }) => {
        if (client && tabElement === currentTab) {
            rpc.setActivity({ ...defaultPresence });
            currentTab = null;
        }
    });

    StaticConfig.keyChanged("appLanguage", (language) => {
        if (barItem.label.startsWith("🚫")) {
            barItem.setLabel(`🚫 ${translate("connectError", language)}`);
            barItem.setHint(translate("reconnect", language));
        } else if (barItem.label.startsWith("📡")) {
            barItem.setLabel(`📡 ${translate("connected", language)}`);
            barItem.setHint(translate("settings", language));
        }
    });
}

function patchItem(item) {
    item.label = "";
    item.hint = null;
    const setLabel = item.setLabel;
    const setHint = item.setHint;
    item.setLabel = (label) => {
        setLabel(label);
        item.label = label;
    }
    item.setHint = (hint) => {
        setHint(hint);
        item.hint = hint;
    }
    return item;
}

function onError(language, API, error) {
    barItem.setLabel(`🚫 ${translate("disconnected", language)}`);
    barItem.setHint(translate("reconnect", language));
    new API.Notification({
        title: translate("error", language),
        content: error.message.replace(/^[a-z]/gi, (c) => c.toUpperCase())
    });
    barItemAction = () => rpc.login({ clientId }).catch((e) => onError(language, API, e));
    barItem.show();
}

function onConnected(language, API) {
    barItem.setLabel(`📡 ${translate("connected", language)}`);
    barItem.setHint(translate("settings", language));
    barItemAction = () => settings.open(API);
    barItem.show();
}