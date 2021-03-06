export const strings = {
    disconnected: {
        english: "Disconnected from Discord",
        spanish: "Desconectado de Discord",
	polish: "Rozłączono z Discordem",
	turkish: "Discord bağlantısı kesildi"
    },
    reconnect: {
        english: "Click here for try to connect",
        spanish: "Clic aquí para intentar conectar",
	polish: "Kliknij tutaj aby połączyć ponownie",
	turkish: "Yeniden denemek için tıklayın"
    },
    connected: {
        english: "Connected to Discord",
        spanish: "Conectado a Discord",
	polish: "Połączono z Discordem",
	turkish: "Discord'a bağlanıldı"
    },
    error: {
        english: "Error in GravitonRPC",
        spanish: "Error en GravitonRPC",
	polish: "Błąd w GravitonRPC",
	turkish: "GravitonRPC'de hata oluştu"
    },
    settings: {
        english: "Click here to open settings",
        spanish: "Clic aquí para abrir la configuración",
	polish: "Kliknij tutaj aby otworzyć ustawienia",
	turkish: "Ayarları açmak için tıklayın"
    },
    dialogTitle: {
        english: "GravitonRPC Settings",
        spanish: "Ajustes de GravitonRPC",
	polish: "Ustawienia GravitonRPC",
	turkish: "GravitonRPC Ayarları"
    },
    elapsed: {
        english: (time) => `${time} elapsed`,
        spanish: (time) => `Tiempo transcurrido: ${time}`,
	polish: (time) => `Minęło: ${time}`,
	turkish: (time) => `${time} geçti`
    },
    clickEdit: {
        english: "Double Click to edit. Changes are automatically saved",
        spanish: "Doble clic para editar. Los cambios son guardados automáticamente",
	polish: "Kliknij podwójnie żeby edytować. Zmiany zostaną zapisane automatycznie",
	turkish: "Düzenlemek için çift tıklayın. Değişiklikler otomatik olarak kaydedilir"
    },
    variables: {
        english: "Useful variables:",
        spanish: "Variables útiles:",
	polish: "Użyteczne zmienne:",
	turkish: "Kullanışlı değişkenler:"
    },
    currentFileTime: {
        english: "Show current file time",
        spanish: "Mostrar tiempo del archivo actual",
	polish: "Pokaż aktualny czas edycji pliku",
	turkish: "Mevcut dosyanın zamanını göster"
    },
    imageText: {
        english: "Image text",
        spanish: "Texto de la imagen",
	polish: "Obraz tekstu",
	turkish: "Resim metni"
    }
};

// brazilian_portuguese, catalan, english, french, german, italian, russian, spanish, polish, turkish

export default function translate(text, language, ...args) {
    let string = strings[text][language];
    if (!string) string = strings[text].english;
    if (!string) return null;
    if (typeof string === "function")
        return string(...args);
    else return string;
}
