import { registerSettings } from "./settings.js";
import { createConfigButtons, createHudButtons, addListener } from "./functions.js";
import { createConfigButtonsV9, createHudButtonsV9, addListenerV9 } from "./v9functions.js";

Hooks.on('init', () => {
    registerSettings();
});

Hooks.on("ready", async function() {
	if(foundry.utils.isNewerVersion(game.version, "10")) addListener();
    else addListenerV9();
});

Hooks.once('ready', () => {
    if (foundry.utils.isNewerVersion(game.version, "12") && game.settings.get("8bit-movement", "disableRotationAnimation")) {
        libWrapper.register('8bit-movement', 'Token.prototype.animate', function (wrapped, ...args) {
            const [attributes, options = {}] = args;

            if (attributes.hasOwnProperty('texture') && attributes.hasOwnProperty('rotation')) {
                options.duration = 0;
            }

            return wrapped(attributes, options);
        }, 'WRAPPER');
    }
});

Hooks.on("renderTokenHUD", async function (sheet) {
    if(foundry.utils.isNewerVersion(game.version, "10")) createHudButtons(sheet);
    else createHudButtonsV9(sheet);
});

Hooks.on("renderTokenConfig", async function (sheet){
    if(foundry.utils.isNewerVersion(game.version, "10")) createConfigButtons(sheet);
    else createConfigButtonsV9(sheet);
})

if (foundry.utils.isNewerVersion(game.version, "12")) {
    Hooks.on("canvasReady", async function (canvas) {
        canvas.tokens.placeables.forEach(token => {
            if (!token.document.getFlag("8bit-movement", "oldPosition")) {
                token.document.setFlag("8bit-movement", "oldPosition", { x: token.document.x, y: token.document.y });
            }
        });
    });
}