const supportedFiles = ["c", "cpp", "css", "git", "html", "javascript", "json", "jsx", "md", "python", "svelte", "txt", "typescript", "vue"];
const DiscordRPC = require("discord-rpc");
const path = window.require("path");
const clientId = "720362061053558805";

exports.entry = ({ RunningConfig, StatusBarItem }) => {
    if (RunningConfig.data.isDev) return;
    const rpc = new DiscordRPC.Client({ transport: "ipc" });
    DiscordRPC.register(clientId);
    const timestamp = Date.now();
    var currentTab;
    rpc.login({ clientId })
        .catch(() => {
            new StatusBarItem({
                label: "🚫 Disconnected from Discord",
                hint: "Click here for try to connect",
                action: () => rpc.login({ clientId })
            });
        });
    rpc.on("connected", () => {
        new StatusBarItem({
            label: "📡 Connected to Discord",
        });
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
            }
            rpc.setActivity({
                details: `Editing ${editingFile}`,
                state: `Workspace: ${workingProject}`,
                startTimestamp: timestamp,
                largeImageKey: supportedFiles.includes(file) ? file : "txt",
                largeImageText: `Editing a ${file.toUpperCase()} file`,
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
}