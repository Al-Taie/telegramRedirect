const error = document.getElementById("error");
const inputField = document.getElementById("inputUrl");
const copyBtn = document.getElementById("copy");
const goToBtn = document.getElementById("active_link");
const convertBtn = document.getElementById("convert")

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        convert();
    }
});

inputField.addEventListener('keydown', () => {
    error.className = "hidden";
    copyBtn.className = "hidden";
    goToBtn.className = "hidden";
    convertBtn.className = "tgme_action_button_new shine";
})

function convert() {
    const website = document.location.host;
    let value = document.getElementById("inputUrl").value;
    if (!value) {
        error.className = "text-error mb-5";
        error.innerHTML = "%error_no_link%";
        return;
    }
    value = value.trim(); //.toLocaleLowerCase();
    const baseValue = value;

    if (value.indexOf("t.me") === -1 && value.indexOf("@") === -1) {
        error.className = "text-error mb-5";
        error.innerHTML = "%error_wrong_link%";
        return;
    }

    let baseScheme = null;
    if (value.indexOf("http://") !== -1)
        baseScheme = "http://";

    if (value.indexOf("https://") !== -1)
        baseScheme = "https://";

    const currentScheme = document.location.protocol + "//";

    value = value.replace("t.me", website).replace("@", currentScheme + website + "/");

    if (baseScheme != null)
        value = value.replace(baseScheme, currentScheme);
    else if (baseValue.indexOf("t.me") !== -1)
        value = currentScheme + value;

    error.className = "hidden";
    convertBtn.className = "hidden";
    inputField.value = value;
    copyBtn.className = "tgme_action_button_new shine";
    goToBtn.href = value;
    goToBtn.className = "tgme_action_button_new shine mt-15";
}

function copy() {
    copyToClipboard(inputField.value.trim());
}

function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(() => {
        console.log('Text copied to clipboard:', str);
    }).catch((error) => {
        console.error('Error copying text to clipboard:', error);
    });
}
