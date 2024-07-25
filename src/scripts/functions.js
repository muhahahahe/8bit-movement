//change image titles for tooltips from Foundry API looks nicer.
const MODULE_NAME = "8bit-movement";
/**
 * Sets up the flags for the image paths when pressing the [+] button on the Token HUD or Token Config.
 * does some string searching to figure out if you used upper case or lower case for the direction tag on your images.
 * @param {string} tokenId | id string of token which is getting its images set.
 */
 async function initializeMovement(tokenId){
    const diagonalMode = game.settings.get(MODULE_NAME, "diagonalMode");
    const token = canvas.tokens.get(tokenId);
    const imagePath = token.document.texture.src.substring(token.document.texture.src.lastIndexOf("/") + 1, token.document.texture.src.lastIndexOf("."));
    let  directions = ["up", "down", "left", "right", "UP", "DOWN", "LEFT", "RIGHT"];
    const hasDirection = directions.find(d => imagePath.includes(d));
    const isLowerCase = directions.indexOf(hasDirection) < 4 ? true : false;
    directions = isLowerCase ? directions : directions.map(d => d.toUpperCase());
    if (diagonalMode) directions = directions.concat(isLowerCase ? ["ul","ur","dl","dr"] : ["UL", "UR", "DL", "DR"])
    if(!hasDirection) {
        await token.document.setFlag(MODULE_NAME, "up",    token.document.texture.src);
        await token.document.setFlag(MODULE_NAME, "down",  token.document.texture.src);
        await token.document.setFlag(MODULE_NAME, "left",  token.document.texture.src);
        await token.document.setFlag(MODULE_NAME, "right", token.document.texture.src);
        if(diagonalMode){
            await token.document.setFlag(MODULE_NAME, "UL", token.document.texture.src);
            await token.document.setFlag(MODULE_NAME, "UR", token.document.texture.src);
            await token.document.setFlag(MODULE_NAME, "DL", token.document.texture.src);
            await token.document.setFlag(MODULE_NAME, "DR", token.document.texture.src);
        }
    }
    else {
        await token.document.setFlag(MODULE_NAME, "up",    token.document.texture.src.replace(hasDirection, directions[0]));
        await token.document.setFlag(MODULE_NAME, "down",  token.document.texture.src.replace(hasDirection, directions[1]));
        await token.document.setFlag(MODULE_NAME, "left",  token.document.texture.src.replace(hasDirection, directions[2]));
        await token.document.setFlag(MODULE_NAME, "right", token.document.texture.src.replace(hasDirection, directions[3]));
        if(diagonalMode){
            await token.document.setFlag(MODULE_NAME, "UL", token.document.texture.src.replace(hasDirection, directions[8]));
            await token.document.setFlag(MODULE_NAME, "UR", token.document.texture.src.replace(hasDirection, directions[9]));
            await token.document.setFlag(MODULE_NAME, "DL", token.document.texture.src.replace(hasDirection, directions[10]));
            await token.document.setFlag(MODULE_NAME, "DR", token.document.texture.src.replace(hasDirection, directions[11]));
        }
    }
    
    await token.document.update({lockRotation: true, rotation: 1})
}

/**
 * This function opens a file picker with the right limitation on what type of file is possible (images and webM).
 * Sets the path of the file in the appropriate flag on the Token.
 * @param {string} tokenId | id string of the token being moved.
 * @param {object} sheet | sheet is an object passed on via renderTokenHud hook.
 * @param {string} direction | string indicating the direction of the token.
 */
async function imageLoader(tokenId, sheet, direction) {
    const token = canvas.tokens.get(tokenId);
    let pickedFile = await new FilePicker({
        type: "imagevideo",
        callback: async (path) => {
            await token.document.setFlag(MODULE_NAME, direction, path);
            sheet.render();
        }
    });
    pickedFile.browse();
}

/**
 * This function adds a listener for the keyup event updating the token in motion with WSAD/Arrow keys,
 * maintains a 0 rotation on SHIFT usage for tokens with the right flags.
 */
export async function addListener() {
    const diagonalMode = game.settings.get(MODULE_NAME, "diagonalMode");
    Hooks.on("preUpdateToken", function changeImage(token, change) {
        if(!token.flags[MODULE_NAME]) return;
        if(!token.getFlag(MODULE_NAME, "up") &&
            !token.getFlag(MODULE_NAME, "down") &&
            !token.getFlag(MODULE_NAME, "right") &&
            !token.getFlag(MODULE_NAME, "left")
        ) {
            if (!game.settings.get(MODULE_NAME, "warnings")) ui.notifications.warn(game.i18n.localize("8BITMOVEMENT.Warn.No_Images"));
            return;
        }
        const move = foundry.utils.hasProperty(change, "x") || foundry.utils.hasProperty(change, "y");
        const rotation = foundry.utils.hasProperty(change, "rotation");
        if ( move ) {
            let direction = "";
            if(diagonalMode){
                if(!token.getFlag(MODULE_NAME, "UL") &&
                    !token.getFlag(MODULE_NAME, "UR") &&
                    !token.getFlag(MODULE_NAME, "DL") &&
                    !token.getFlag(MODULE_NAME, "DR")
                ) {
                    if (!game.settings.get(MODULE_NAME, "warnings")) ui.notifications.warn(game.i18n.localize("8BITMOVEMENT.Warn.No_Images_Diagonal"));
                    return;
                }
                if (foundry.utils.isNewerVersion(game.version, "12")) {
                    if(token.x === change.x && token.y === change.y) return;
                    if(token.x > change.x && token.y === change.y) direction = "left";
                    if(token.x < change.x && token.y === change.y) direction = "right";
                    if(token.y > change.y && token.x === change.x) direction = "up";
                    if(token.y < change.y && token.x === change.x) direction = "down";
                    if(token.x > change.x && token.y > change.y) direction = "up-left";
                    if(token.x < change.x && token.y > change.y) direction = "up-right";
                    if(token.x > change.x && token.y < change.y) direction = "down-left";
                    if(token.x < change.x && token.y < change.y) direction = "down-right";
                } else {
                    if(token.x > change.x && !change.y) direction = "left";
                    if(token.x < change.x && !change.y) direction = "right";
                    if(token.y > change.y && !change.x) direction = "up";
                    if(token.y < change.y && !change.x) direction = "down";
                    if(token.x > change.x && token.y > change.y) direction = "up-left";
                    if(token.x < change.x && token.y > change.y) direction = "up-right";
                    if(token.x > change.x && token.y < change.y) direction = "down-left";
                    if(token.x < change.x && token.y < change.y) direction = "down-right";
                }
            } else {
                if(token.x > change.x) direction = "left";
                if(token.x < change.x) direction = "right";
                if(token.y > change.y) direction = "up";
                if(token.y < change.y) direction = "down";
            }
            if(direction === "up") {
                if(token.texture.src === token.flags[MODULE_NAME].up) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].up);
            }
            if(direction === "down") {
                if(token.texture.src === token.flags[MODULE_NAME].down) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].down);
            }
            if(direction === "left") {
                if(token.texture.src === token.flags[MODULE_NAME].left) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].left);
            }
            if(direction === "right") {
                if(token.texture.src === token.flags[MODULE_NAME].right) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].right);
            }
            if(direction === "up-left") {
                if(token.texture.src === token.flags[MODULE_NAME].UL) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].UL);                
            }
            if(direction === "up-right") {
                if(token.texture.src === token.flags[MODULE_NAME].UR) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].UR);                  
            }
            if(direction === "down-left") {
                if(token.texture.src === token.flags[MODULE_NAME].DL) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].DL);                
            }
            if(direction === "down-right") {
                if(token.texture.src === token.flags[MODULE_NAME].DR) return;
                foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].DR);                 
            }
        }
        else if(rotation) {
            switch(foundry.utils.getProperty(change, "rotation")){
                case 0: 
                    if(token.texture.src === token.flags[MODULE_NAME].down) return;
                    foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].down);
                    delete change.rotation
                    break;
                case 90: 
                    if(token.texture.src === token.flags[MODULE_NAME].left) return;
                    foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].left);
                    delete change.rotation
                    break;
                case 180: 
                    if(token.texture.src === token.flags[MODULE_NAME].up) return;
                    foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].up);
                    delete change.rotation
                    break;
                case 270: 
                    if(token.texture.src === token.flags[MODULE_NAME].right) return;
                    foundry.utils.setProperty(change, "texture.src", token.flags[MODULE_NAME].right);
                    delete change.rotation
                    break;
                default: break;
            }
        }
    });
}

/**
 * This function adds buttons to the Token HUD. Allowing for modifications to be done.
 * @param {object} sheet | recieves the sheet from the renderTokenHud hook.
 */
export async function createHudButtons(sheet) {
    if(!game.settings.get(MODULE_NAME, "tokenMode")) return;
    if(game.settings.get(MODULE_NAME, "gmMode") && !game.user.isGM) return;
    const token = sheet.object;
    $("#token-hud .col.middle").append(`<div class="image-box"></div>`);
    if(!token.document.flags.hasOwnProperty(MODULE_NAME)) {
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="set-images"><i class="far fa-plus-square" title="${game.i18n.format("8BITMOVEMENT.activate")}"></i></div>`);
        $("#set-images").click(async function() { 
            await initializeMovement(token.id); 
            sheet.render();
        });
    } else {
        if(token.document.getFlag(MODULE_NAME, "locked")) {
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="unlock-images" ><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></div></div>`);
            $("#unlock-images").click(async function(){
                $(".image-box").empty();
                await token.document.setFlag(MODULE_NAME, "locked", false);
                sheet.render();
            });
            return;
        }
        const upImage = token.document.getFlag(MODULE_NAME, "up") || token.actor.img;
        const downImage = token.document.getFlag(MODULE_NAME, "down") || token.actor.img;
        const leftImage = token.document.getFlag(MODULE_NAME, "left") || token.actor.img;
        const rightImage = token.document.getFlag(MODULE_NAME, "right") || token.actor.img;
        const upLeftImage = token.document.getFlag(MODULE_NAME, "UL") || token.actor.img;
        const upRightImage = token.document.getFlag(MODULE_NAME, "UR") || token.actor.img;
        const downLeftImage = token.document.getFlag(MODULE_NAME, "DL") || token.actor.img;
        const downRightImage = token.document.getFlag(MODULE_NAME, "DR") || token.actor.img;

        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="lock-images" ><i class="fas fa-lock-open" title="${game.i18n.format("8BITMOVEMENT.lock")}"></i></div>`);
        $("#lock-images").click(async function(){
            await token.document.setFlag(MODULE_NAME, "locked", true);
            $(".image-box").empty();
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="unlock-images" ><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></div>`);
            $("#unlock-images").click(async function(){
                $(".image-box").empty();
                await token.document.setFlag(MODULE_NAME, "locked", false);
                sheet.render();
            });
        });    
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="up-image" ><i class="fas fa-angle-up"></i><img src="${upImage}" title="${game.i18n.format("8BITMOVEMENT.up")}"></div>`);
        $("#up-image").click(async function(){
            await imageLoader(token.id, sheet, "up");
        });
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="down-image" ><i class="fas fa-angle-down"></i><img src="${downImage}" title="${game.i18n.format("8BITMOVEMENT.down")}"></div>`);
        $("#down-image").click(async function(){
            await imageLoader(token.id, sheet, "down");
        });
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="left-image" ><i class="fas fa-angle-left" ></i><img src="${leftImage}" title="${game.i18n.format("8BITMOVEMENT.left")}"></div>`);
        $("#left-image").click(async function(){
            await imageLoader(token.id, sheet, "left");
        });
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="right-image" ><i class="fas fa-angle-right"></i><img src="${rightImage}" title="${game.i18n.format("8BITMOVEMENT.right")}"></div>`);
        $("#right-image").click(async function(){
            await imageLoader(token.id, sheet, "right");
        });
        if(game.settings.get(MODULE_NAME, "diagonalMode")){
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="up-left-image" ><div>UL</div><img src="${upLeftImage}" title="${game.i18n.format("8BITMOVEMENT.up-left")}"></div>`);
            $("#up-left-image").click(async function(){
                await imageLoader(token.id, sheet, "UL");
            });
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="up-right-image" ><div>UR</div><img src="${upRightImage}" title="${game.i18n.format("8BITMOVEMENT.up-right")}"></div>`);
            $("#up-right-image").click(async function(){
                await imageLoader(token.id, sheet, "UR");
            });
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="down-left-image" ><div>DL</div><img src="${downLeftImage}" title="${game.i18n.format("8BITMOVEMENT.down-left")}"></div>`);
            $("#down-left-image").click(async function(){
                await imageLoader(token.id, sheet, "DL");
            });
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon" id="down-right-image" ><div>DR</div><img src="${downRightImage}" title="${game.i18n.format("8BITMOVEMENT.down-right")}"></div>`);
            $("#down-right-image").click(async function(){
                await imageLoader(token.id, sheet, "DR");
            });
        }


        if(token.document.getFlag(MODULE_NAME, "set")){
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="remove-from-prototype" ><i class="fas fa-times" title="${game.i18n.format("8BITMOVEMENT.delete")}"></i></div>`);
            $("#remove-from-prototype").click(async function(){
                await game.actors.get(token.actor.id).update({"prototypeToken.flags.-=8bit-movement": null, "prototypeToken.img": downImage, "prototypeToken.lockRotation": false});
                await token.document.update({"flags.-=8bit-movement": null, lockRotation: false, rotation: 0});
                sheet.render();
            });
        }
        else {
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="save-to-prototype" ><i class="fas fa-address-card" title="${game.i18n.format("8BITMOVEMENT.save")}"></i></div>`);
            $("#save-to-prototype").click(async function(){
                await game.actors.get(token.actor.id).update({"prototypeToken.flags.8bit-movement": {up: upImage, down: downImage, left: leftImage, right: rightImage, set: true}, "prototypeToken.img": downImage, "prototypeToken.lockRotation": true});
                await token.document.setFlag(MODULE_NAME, "set", true);
                sheet.render();
            });
        }
    }   
}
/**
 * Makes the buttons on the Token Config window.
 * @param {object} sheet | recieves the sheet from the renderTokenConfig hook. 
 */
export async function createConfigButtons(sheet) {
    if(!game.settings.get(MODULE_NAME, "settingsMode")) return;
    if(game.settings.get(MODULE_NAME, "gmMode") && !game.user.isGM) return;
    const tab = "appearance";
    const token = sheet.object; // for some reason when getting it from the Config Sheet you get the TokenDocument!
    if(token.documentName !== "Token") return; // for now prevents it from running on the prototype token hud.
    if(!token.flags.hasOwnProperty(MODULE_NAME)) {
        sheet.element.find(`.window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.activate_label")}</label><div class="form-fields"><a class="movement-settings activate"><i class="far fa-plus-square" title="${game.i18n.format("8BITMOVEMENT.activate")}"></i></a></div></div>`);
        sheet.element.find(`.movement-settings.activate`).click(async function(){ 
            await initializeMovement(token.id);
            sheet.render(); 
        });
    }
    else {
        const upImage = token.getFlag(MODULE_NAME, "up");
        const downImage = token.getFlag(MODULE_NAME, "down");
        const leftImage = token.getFlag(MODULE_NAME, "left");
        const rightImage = token.getFlag(MODULE_NAME, "right");
        if(token.getFlag(MODULE_NAME, "locked")) {
            sheet.element.find(`.window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.unlock")}: </label><div class="form-fields"><a class="movement-settings unlock"><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></a></div></div>`);
            sheet.element.find(`.movement-settings.unlock`).click(async function(){
                await token.setFlag(MODULE_NAME, "locked", false);
                sheet.render();
            });
        }
        else {
            sheet.element.find(`.window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.settings")}</label><div class="form-fields"></div></div>`);
            sheet.element.find(`.form-group.movement-form-group .form-fields`).append(`<a class="movement-settings lock"><i class="fas fa-lock-open" title="${game.i18n.format("8BITMOVEMENT.lock")}"></i></a>
                                                                                        <a class="movement-settings up-image"><img src="${upImage}" title="${game.i18n.format("8BITMOVEMENT.up")}"></a>
                                                                                        <a class="movement-settings down-image"><img src="${downImage}" title="${game.i18n.format("8BITMOVEMENT.down")}"></a>
                                                                                        <a class="movement-settings left-image"><img src="${leftImage}" title="${game.i18n.format("8BITMOVEMENT.left")}"></a>
                                                                                        <a class="movement-settings right-image"><img src="${rightImage}" title="${game.i18n.format("8BITMOVEMENT.right")}"></a>
                                                                                        `);
            sheet.element.find(`.movement-settings.up-image`).click(async function(){
                await imageLoader(token.id, sheet, "up");
            });
            sheet.element.find(`.movement-settings.down-image`).click(async function(){
                await imageLoader(token.id, sheet, "down");
            });
            sheet.element.find(`.movement-settings.left-image`).click(async function(){
                await imageLoader(token.id, sheet, "left");
            });
            sheet.element.find(`.movement-settings.right-image`).click(async function(){
                await imageLoader(token.id, sheet, "right");
            });
            sheet.element.find(`.movement-settings.lock`).click(async function(){
                await token.setFlag(MODULE_NAME, "locked", true);
                sheet.render();
            });
            if(token.getFlag(MODULE_NAME, "set")){
                sheet.element.find(`.form-group.movement-form-group .form-fields`).append(`<a class="movement-settings remove"><i class="fas fa-times" title="${game.i18n.format("8BITMOVEMENT.delete")}"></i></a>`);
                sheet.element.find(`.movement-settings.remove`).click(async function(){
                    await game.actors.get(token.actor.id).update({"prototypeToken.flags.-=8bit-movement": null, "prototypeToken.img": downImage, "prototypeToken.lockRotation": false});
                    await token.update({"flags.-=8bit-movement": null, lockRotation: false, rotation: 0});
                    sheet.render();
                });
            }
            else {
                sheet.element.find(`.form-group.movement-form-group .form-fields`).append(`<a class="movement-settings save" ><i class="fas fa-address-card" title="${game.i18n.format("8BITMOVEMENT.save")}"></i></a>`);
                sheet.element.find(`.movement-settings.save`).click(async function(){
                    await game.actors.get(token.actor.id).update({"prototypeToken.flags.8bit-movement": {up: upImage, down: downImage, left: leftImage, right: rightImage, set: true}, "prototypeToken.img": downImage, "prototypeToken.lockRotation": true});
                    await token.setFlag(MODULE_NAME, "set", true);
                    sheet.render();
                });
            }
        }
    }
    sheet.element.height("auto");
}