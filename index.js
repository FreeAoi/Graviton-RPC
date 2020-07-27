import openSettings from "./settings.js";
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

export const entry = (API) => {
    const { RunningConfig, StatusBarItem, StaticConfig } = API;
    if (RunningConfig.data.isDev) return;
    barItem = new StatusBarItem({
        label: "",
        action: () => barItemAction()
    });
    barItem.hide();
    rpc.login({ clientId }).catch((e) => onError(StaticConfig.data.appLanguage, API, e));
    rpc.on("connected", () => {
        onConnected(StaticConfig.data.appLanguage, API);
        rpc.setActivity({
            largeImageKey: "applogo",
            largeImageText: "Graviton Editor",
            startTimestamp: timestamp,
            instance: false
        });
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
                details: `Editing ${editingFile}`,
                state: `Workspace: ${workingProject}`,
                startTimestamp: timestamp,
                largeImageKey: supportedFiles.includes(file) ? file : "txt",
                largeImageText: `Editing a ${file.replace(/^[a-z]/gi, (c) => c.toUpperCase())} file`,
                smallImageKey: "applogo",
                smallImageText: "Graviton",
                instance: false,
            });
            currentTab = tabElement;
        }
    });

    RunningConfig.on("aTabHasBeenClosed", ({ client, tabElement }) => {
        if (client && tabElement === currentTab) {
            rpc.setActivity({
                largeImageKey: "applogo",
                largeImageText: "Graviton Editor",
                startTimestamp: timestamp,
                instance: false
            });
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
    barItemAction = () => openSettings(API);
    barItem.show();
}