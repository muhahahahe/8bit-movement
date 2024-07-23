/**
 * Sets up the flags for the image paths when pressing the [+] button on the Token HUD or Token Config.
 * does some string searching to figure out if you used upper case or lower case for the direction tag on your images.
 * @param {string} tokenId | id string of token which is getting its images set.
 */
 async function initializeMovement(tokenId){
    const diagonalMode = game.settings.get("8bit-movement", "diagonalMode");
    const token = canvas.tokens.get(tokenId);
    const imagePath = token.data.img.substring(token.data.img.lastIndexOf("/") + 1, token.data.img.lastIndexOf("."));
    let  directions = ["up", "down", "left", "right", "UP", "DOWN", "LEFT", "RIGHT"];
    const hasDirection = directions.find(d => imagePath.includes(d));
    const isLowerCase = directions.indexOf(hasDirection) < 4 ? true : false;
    directions = isLowerCase ? directions : directions.map(d => d.toUpperCase());
    if (diagonalMode) directions = directions.concat(isLowerCase ? ["ul","ur","dl","dr"] : ["UL", "UR", "DL", "DR"])
    console.log(directions)
    if(!hasDirection) {
        await token.document.setFlag("8bit-movement", "up",    token.data.img);
        await token.document.setFlag("8bit-movement", "down",  token.data.img);
        await token.document.setFlag("8bit-movement", "left",  token.data.img);
        await token.document.setFlag("8bit-movement", "right", token.data.img);
        if(diagonalMode){
            await token.document.setFlag("8bit-movement", "UL", token.data.img);
            await token.document.setFlag("8bit-movement", "UR", token.data.img);
            await token.document.setFlag("8bit-movement", "DL", token.data.img);
            await token.document.setFlag("8bit-movement", "DR", token.data.img);
        }
    }
    else {
        await token.document.setFlag("8bit-movement", "up",    token.data.img.replace(hasDirection, directions[0]));
        await token.document.setFlag("8bit-movement", "down",  token.data.img.replace(hasDirection, directions[1]));
        await token.document.setFlag("8bit-movement", "left",  token.data.img.replace(hasDirection, directions[2]));
        await token.document.setFlag("8bit-movement", "right", token.data.img.replace(hasDirection, directions[3]));
        if(diagonalMode){
            await token.document.setFlag("8bit-movement", "UL", token.data.img.replace(hasDirection, directions[8]));
            await token.document.setFlag("8bit-movement", "UR", token.data.img.replace(hasDirection, directions[9]));
            await token.document.setFlag("8bit-movement", "DL", token.data.img.replace(hasDirection, directions[10]));
            await token.document.setFlag("8bit-movement", "DR", token.data.img.replace(hasDirection, directions[11]));
        }
    }
    
    await token.document.update({lockRotation: true})
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
            await token.document.setFlag("8bit-movement", direction, path);
            sheet.render();
        }
    });
    pickedFile.browse();
}

/**
 * This function adds a listener for the keyup event updating the token in motion with WSAD/Arrow keys,
 * maintains a 0 rotation on SHIFT usage for tokens with the right flags.
 */
export async function addListenerV9() {
    window.addEventListener("keyup", async function walking(event) {
        let img = "";
        let change = false;
        if(canvas.scene === null) return;                            // prevents the listener from doing anything when canvas is switched off.
        if($("#chat-message").is(":focus")) return;                  // returns if typing in the chat box, to prevent rotatating while typing.
        if(!canvas.tokens.controlled.length) return;                 // returns if no token is selected
        let update = [];
        const diagonalMode = game.settings.get("8bit-movement", "diagonalMode");
        for(let token of canvas.tokens.controlled){
            if(!token.data.flags.hasOwnProperty("8bit-movement")) continue; // if a token hasnt been setup yet via the token hud, it returns without doing anything.
            if(event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Numpad8") {
                img = token.document.getFlag("8bit-movement", "up");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true; 
                }                    
            }
            if(event.code === "ArrowDown" || event.code === "KeyS" || event.code === "Numpad2") {
                img = token.document.getFlag("8bit-movement", "down");
                if(token.data.img !== img){
                    update.push({img, _id: token.id}); 
                    change = true;
                } 
            }
            if(event.code === "ArrowLeft" || event.code === "KeyA" || event.code === "Numpad4"){
                img = token.document.getFlag("8bit-movement", "left");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true;
                }
            }
            if(event.code === "ArrowRight" || event.code === "KeyD" || event.code === "Numpad6") {
                img = token.document.getFlag("8bit-movement", "right");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true;
                }
            }
            if( diagonalMode && event.code === "Numpad7") {
                img = token.document.getFlag("8bit-movement", "UL");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true; 
                }                    
            }
            if( diagonalMode && event.code === "Numpad9") {
                img = token.document.getFlag("8bit-movement", "UR");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true; 
                }                    
            }
            if( diagonalMode && event.code === "Numpad1") {
                img = token.document.getFlag("8bit-movement", "DL");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true; 
                }                    
            }
            if( diagonalMode && event.code === "Numpad3") {
                img = token.document.getFlag("8bit-movement", "DR");
                if(token.data.img !== img) {
                    update.push({img, _id: token.id});
                    change = true; 
                }                    
            }
        }
        if (change) await canvas.scene.updateEmbeddedDocuments("Token", update);         // for any key other WASD and arrow keys it comes back with changes is false and doesnt update.
    });
}

/**
 * This function adds buttons to the Token HUD. Allowing for modifications to be done.
 * @param {object} sheet | recieves the sheet from the renderTokenHud hook.
 */
export async function createHudButtonsV9(sheet) {
    if(!game.settings.get("8bit-movement", "tokenMode")) return;
    if(game.settings.get("8bit-movement", "gmMode") && !game.user.isGM) return;
    const token = sheet.object;
    $("#token-hud .col.middle").append(`<div class="image-box"></div>`);
    if(!token.data.flags.hasOwnProperty("8bit-movement")) {
        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="set-images"><i class="far fa-plus-square" title="${game.i18n.format("8BITMOVEMENT.activate")}"></i></div>`);
        $("#set-images").click(async function() { 
            await initializeMovement(token.id); 
            sheet.render();
        });
    }
    else {
        if(token.document.getFlag("8bit-movement", "locked")) {
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="unlock-images" ><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></div></div>`);
            $("#unlock-images").click(async function(){
                $(".image-box").empty();
                await token.document.setFlag("8bit-movement", "locked", false);
                sheet.render();
            });
            return;
        }
        const upImage = token.document.getFlag("8bit-movement", "up");
        const downImage = token.document.getFlag("8bit-movement", "down");
        const leftImage = token.document.getFlag("8bit-movement", "left");
        const rightImage = token.document.getFlag("8bit-movement", "right");
        const upLeftImage = token.document.getFlag("8bit-movement", "UL");
        const upRightImage = token.document.getFlag("8bit-movement", "UR");
        const downLeftImage = token.document.getFlag("8bit-movement", "DL");
        const downRightImage = token.document.getFlag("8bit-movement", "DR");

        $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="lock-images" ><i class="fas fa-lock-open" title="${game.i18n.format("8BITMOVEMENT.lock")}"></i></div>`);
        $("#lock-images").click(async function(){
            await token.document.setFlag("8bit-movement", "locked", true);
            $(".image-box").empty();
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option middle" id="unlock-images" ><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></div>`);
            $("#unlock-images").click(async function(){
                $(".image-box").empty();
                await token.document.setFlag("8bit-movement", "locked", false);
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
        if(game.settings.get("8bit-movement", "diagonalMode")){
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


        if(token.document.getFlag("8bit-movement", "set")){
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="remove-from-prototype" ><i class="fas fa-times" title="${game.i18n.format("8BITMOVEMENT.delete")}"></i></div>`);
            $("#remove-from-prototype").click(async function(){
                await game.actors.get(token.actor.id).update({"token.flags.-=8bit-movement": null, "token.img": downImage, "token.lockRotation": false});
                await token.document.update({"flags.-=8bit-movement": null, lockRotation: false});
                sheet.render();
            });
        }
        else {
            $("#token-hud .col.middle .image-box").append(`<div class="movement-icon option" id="save-to-prototype" ><i class="fas fa-address-card" title="${game.i18n.format("8BITMOVEMENT.save")}"></i></div>`);
            $("#save-to-prototype").click(async function(){
                await game.actors.get(token.actor.id).update({"token.flags.8bit-movement": {up: upImage, down: downImage, left: leftImage, right: rightImage, set: true}, "token.img": downImage, "token.lockRotation": true});
                await token.document.setFlag("8bit-movement", "set", true);
                sheet.render();
            });
        }
    }   
}
/**
 * Makes the buttons on the Token Config window.
 * @param {object} sheet | recieves the sheet from the renderTokenConfig hook. 
 */
export async function createConfigButtonsV9(sheet) {
    if(!game.settings.get("8bit-movement", "settingsMode")) return;
    if(game.settings.get("8bit-movement", "gmMode") && !game.user.isGM) return;
    const tab = !!game.version ? "appearance" : "image"
    console.log(tab);
    const token = sheet.object;
    console.log($(`#token-config-${token.id} .window-content .tab[data-tab="${tab}"]`))
    if(token.documentName !== "Token") return; // for now prevents it from running on the prototype token hud.
    if(!token.data.flags.hasOwnProperty("8bit-movement")) {
        $(`#token-config-${token.id} .window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.activate_label")}</label><div class="form-fields"><a class="movement-settings activate"><i class="far fa-plus-square" title="${game.i18n.format("8BITMOVEMENT.activate")}"></i></a></div></div>`);
        $(`#token-config-${token.id} .movement-settings.activate`).click(async function(){ 
            await initializeMovement(token.id);
            sheet.render(); 
        });
    }
    else {
        const upImage = token.getFlag("8bit-movement", "up");
        const downImage = token.getFlag("8bit-movement", "down");
        const leftImage = token.getFlag("8bit-movement", "left");
        const rightImage = token.getFlag("8bit-movement", "right");
        if(token.getFlag("8bit-movement", "locked")) {
            $(`#token-config-${token.id} .window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.unlock")}: </label><div class="form-fields"><a class="movement-settings unlock"><i class="fas fa-lock" title="${game.i18n.format("8BITMOVEMENT.unlock")}"></i></a></div></div>`);
            $(`#token-config-${token.id} .movement-settings.unlock`).click(async function(){
                await token.setFlag("8bit-movement", "locked", false);
                sheet.render();
            });
        }
        else {
            $(`#token-config-${token.id} .window-content .tab[data-tab="${tab}"]`).append(`<div class="form-group movement-form-group"><label class="movement-label">${game.i18n.format("8BITMOVEMENT.settings")}</label><div class="form-fields"></div></div>`);
            $(`#token-config-${token.id} .form-group.movement-form-group .form-fields`).append(`<a class="movement-settings lock"><i class="fas fa-lock-open" title="${game.i18n.format("8BITMOVEMENT.lock")}"></i></a>
                                                                                        <a class="movement-settings up-image"><img src="${upImage}" title="${game.i18n.format("8BITMOVEMENT.up")}"></a>
                                                                                        <a class="movement-settings down-image"><img src="${downImage}" title="${game.i18n.format("8BITMOVEMENT.down")}"></a>
                                                                                        <a class="movement-settings left-image"><img src="${leftImage}" title="${game.i18n.format("8BITMOVEMENT.left")}"></a>
                                                                                        <a class="movement-settings right-image"><img src="${rightImage}" title="${game.i18n.format("8BITMOVEMENT.right")}"></a>
                                                                                        `);
            $(`#token-config-${token.id} .movement-settings.up-image`).click(async function(){
                await imageLoader(token.id, sheet, "up");
            });
            $(`#token-config-${token.id} .movement-settings.down-image`).click(async function(){
                await imageLoader(token.id, sheet, "down");
            });
            $(`#token-config-${token.id} .movement-settings.left-image`).click(async function(){
                await imageLoader(token.id, sheet, "left");
            });
            $(`#token-config-${token.id} .movement-settings.right-image`).click(async function(){
                await imageLoader(token.id, sheet, "right");
            });
            $(`#token-config-${token.id} .movement-settings.lock`).click(async function(){
                await token.setFlag("8bit-movement", "locked", true);
                sheet.render();
            });
            if(token.getFlag("8bit-movement", "set")){
                $(`#token-config-${token.id} .form-group.movement-form-group .form-fields`).append(`<a class="movement-settings remove"><i class="fas fa-times" title="${game.i18n.format("8BITMOVEMENT.delete")}"></i></a>`);
                $(`#token-config-${token.id} .movement-settings.remove`).click(async function(){
                    await game.actors.get(token.actor.id).update({"token.flags.-=8bit-movement": null, "token.img": downImage, "token.lockRotation": false});
                    await token.update({"flags.-=8bit-movement": null, lockRotation: false});
                    sheet.render();
                });
            }
            else {
                $(`#token-config-${token.id} .form-group.movement-form-group .form-fields`).append(`<a class="movement-settings save" ><i class="fas fa-address-card" title="${game.i18n.format("8BITMOVEMENT.save")}"></i></a>`);
                $(`#token-config-${token.id} .movement-settings.save`).click(async function(){
                    await game.actors.get(token.actor.id).update({"token.flags.8bit-movement": {up: upImage, down: downImage, left: leftImage, right: rightImage, set: true}, "token.img": downImage, "token.lockRotation": true});
                    await token.setFlag("8bit-movement", "set", true);
                    sheet.render();
                });
            }
        }
    }
    sheet.element.height("auto");
}
