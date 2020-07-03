const DiscordRPC = require('discord-rpc')
const path = window.require('path')

function entry({ RunningConfig, Notification, StaticConfig }) {
     const { isDev } = RunningConfig.data
     if(isDev) return
     const clientId = '720362061053558805'
     DiscordRPC.register(clientId);
     const rpc = new DiscordRPC.Client({ transport: 'ipc' })
     let currentTab
     const timestamp = Date.now()
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
     rpc.on('ready', () => {
          rpc.setActivity({
               largeImageKey: 'applogo',
               largeImageText: 'Graviton Editor',
               startTimestamp: timestamp,
               instance: false
          })
     });

     RunningConfig.on('aTabHasBeenFocused', ({ client, instance, parentFolder, directory, tabElement }) => {
          if (client) {
               const editingFile = path.basename(path.normalize(directory))
               const workingProject = path.basename(path.normalize(parentFolder))
               let file = client.do('getMode', { instance }).name;
               switch (file) {
                    case 'application/json':
                         file = 'json'
                         break;
                    case 'gfm':
                         file = 'md'
                         break;
               }
               rpc.setActivity({
                    details: `Editing ${editingFile}`,
                    state: `Workspace: ${workingProject}`,
                    startTimestamp: timestamp,
                    largeImageKey: file,
                    largeImageText: `Editing a ${file} file`,
                    smallImageKey: 'applogo',
                    smallImageText: 'Graviton',
                    instance: false,
               })
               currentTab = tabElement
          }
     })
     RunningConfig.on('aTabHasBeenClosed', ({ client, instance, directory, tabElement }) => {
          if (client && tabElement === currentTab) {
               rpc.setActivity({
                    largeImageKey: 'applogo',
                    largeImageText: 'Graviton Editor',
                    startTimestamp: timestamp,
                    instance: false
               })
               currentTab = null
          }
     })
}

module.exports = {
     entry
}
