import { registerSettings } from "./settings.js";
import { createConfigButtons, createHudButtons, addListener } from "./functions.js";
import {createConfigButtonsV9, createHudButtonsV9, addListenerV9 } from "./v9functions.js";

Hooks.on('init', () => {
    registerSettings();
});

Hooks.on("ready", async function() {
	if(isNewerVersion(game.version, "10")) addListener();
    else addListenerV9();
});

Hooks.on("renderTokenHUD", async function (sheet) {
    if(isNewerVersion(game.version, "10")) createHudButtons(sheet);
    else createHudButtonsV9(sheet);
});

Hooks.on("renderTokenConfig", async function (sheet){
    if(isNewerVersion(game.version, "10")) createConfigButtons(sheet);
    else createConfigButtonsV9(sheet);
})