export const strings = {
    disconnected: {
        english: "Disconnected from Discord",
        spanish: "Desconectado de Discord"
    },
    reconnect: {
        english: "Click here for try to connect",
        spanish: "Clic aquí para intentar conectar"
    },
    connected: {
        english: "Connected to Discord",
        spanish: "Conectado a Discord"
    },
    error: {
        english: "Error in GravitonRPC",
        spanish: "Error en GravitonRPC"
    },
    settings: {
        english: "Click here to open settings",
        spanish: "Clic aquí para abrir la configuración"
    },
    dialogTitle: {
        english: "GravitonRPC Settings",
        spanish: "Ajustes de GravitonRPC"
    }
};

// brazilian_portuguese, catalan, english, french, german, italian, russian, spanish, polish

export default function translate(text, language) {
    let string = strings[text][language];
    if (!string) string = strings[text].english;
    if (!string) return null;
    return string;
}