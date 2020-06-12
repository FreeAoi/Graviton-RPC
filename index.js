const DiscordRPC = require("discord-rpc");

function entry({ RunningConfig, Notification, StaticConfig }) {

    console.log(StaticConfig.data)
    let clientId = '720362061053558805';
    DiscordRPC.register(clientId);
    const rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.login({ clientId }).catch(error => {
        new Notification({
            title: 'DiscordRP',
            content: 'Has been impossible to connect the rich presence to your discord.',
            buttons: [{
                label: 'Click here for try again',
                action() {
                    rpc.login({ clientId });
                }
            }]
        })
    })
    let timestamp = Date.now()
    rpc.on('ready', () => {
        rpc.setActivity({
            largeImageKey: "applogo",
            largeImageText: "Graviton Editor",
            startTimestamp: timestamp,
            instance: false
        })
        new Notification({
            title: 'DiscordRP',
            content: 'The connection to Discord has been stablished.'
        })
    });

    RunningConfig.on('aTabHasBeenFocused', ({ client, instance, directory, tabElement }) => {
        if (client) {
            let getEditingFile = directory.split("\\");
            let getProject = tabElement.state.data.parentFolder.split("\\")
            let file = client.do('getMode', { instance }).name;
            switch (file) {
            case "application/json":
                file = "json"
                break;
            case "gfm":
                file = "md"
                break;
            }
            rpc.setActivity({
                details: `Editing ${getEditingFile[getEditingFile.length - 1]}`,
                state: `Workspace: ${getEditingFile[getProject.length - 1]}`,
                startTimestamp: timestamp,
                largeImageKey: file,
                largeImageText: `Editing a ${file} file`,
                smallImageKey: 'applogo',
                smallImageText: 'Graviton',
                instance: false,
            });
        }
    });

    StaticConfig.keyChanged('discordRP',()=>{
        console.log('A new theme has been selected')
    })
}

module.exports = {
    entry
}