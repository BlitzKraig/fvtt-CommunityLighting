class CLCustomPropertyManager {

    static async saveCustomProperties(object, changes) {
        var customProperties = JSON.parse(JSON.stringify(changes.lightAnimation)); // Clone changes

        // Ensure we are not saving the data core stores in the db
        Object.keys(customProperties).forEach(key=>{
            if(key == "type" || key == "intensity" || key == "speed"){
                delete customProperties[key];
            }               
        });
        var placeable = canvas.lighting.get(object._id) || canvas.tokens.get(object._id);
        if(!customProperties || Object.getOwnPropertyNames(customProperties).length == 0){
            await placeable.unsetFlag("CommunityLighting", "customProperties"); // Remove flag if no custom vars
        } else {
            await placeable.setFlag("CommunityLighting", "customProperties", customProperties); // Set flag with custom vars
        }
        if(object.actorId){
            CLCustomPropertyManager.loadCustomProperties(canvas.tokens.get(object._id).light);
        }
    }

    static loadCustomProperties(pointSource) {
        if(!pointSource._source){
            return; // Source is not cached yet, return
        }
        var customProperties = pointSource._source.getFlag("CommunityLighting", "customProperties");

        // Remove any customProperties from the current lightAnimation object
        Object.keys(pointSource._source.data.lightAnimation).forEach(key=>{
            if(key != "type" && key != "intensity" && key != "speed"){
                delete pointSource._source.data.lightAnimation[key];
            }               
        });

        if(customProperties){
            // Add customProperties from the flag into the lightAnimation object
            mergeObject(pointSource._source.data.lightAnimation, customProperties)
            if(pointSource._source.actor){
                pointSource._source.update({lightAnimation: pointSource._source.data.lightAnimation}, {diff:false, loadedProperty:true})
            }
        }

    }

    static async removeAllCustomProperties(html) {
        html.find("#community-lighting-custom-image").attr('name', 'removing');
        html.find(".community-lighting-custom-property").children('input').attr('name', 'removing');
        html.find(".community-lighting-custom-property").hide('normal', function () {
            $(this).remove();
        });
    }

    static async addCustomProperties(objectConfig, customPropertySibling, customAnimationProperties, animationName, isToken, animateShow = false) {

        var supports = { ...CONFIG.Canvas.lightAnimations[animationName].illuminationShader.supports, ...CONFIG.Canvas.lightAnimations[animationName].colorationShader.supports}

        var customAnimationPropertiesClone = JSON.parse(JSON.stringify(customAnimationProperties)); // Clone object so we can reverse it without reversing original
        
        customAnimationPropertiesClone.reverse().forEach((customPropertyObject) => {
            if(customPropertyObject.supports && !supports[customPropertyObject.supports]){
                return;
            }
            var currentValue;
            if (isToken) {
                if (objectConfig.object.light.animation) {
                    currentValue = objectConfig.object.light.animation[customPropertyObject.varName] ?? customPropertyObject.default;
                } else {
                    currentValue = customPropertyObject.default;
                }
            } else {
                if (objectConfig.object.source.animation) {
                    currentValue = objectConfig.object.source.animation[customPropertyObject.varName] ?? customPropertyObject.default;
                } else {
                    currentValue = customPropertyObject.default;
                }
            }
            switch (customPropertyObject.type) {
                case "animationName":
                    // Add hidden animation name
                    var customPropertyEl = $(`<div class="form-group community-lighting-custom-property" style="display:none">
                    <input class="text" type="text" name="lightAnimation.animationName" value="${currentValue}">
                    </div>`);
                    customPropertySibling.after(customPropertyEl);
                    break;
                case "color":
                    var customPropertyEl = $(
                        `<div class="form-group community-lighting-custom-property">
                            <label>${customPropertyObject.title}</label>
                            <input class="color" type="text" name="lightAnimation.${customPropertyObject.varName}" value="${currentValue}">
                            <input type="color" value="${currentValue}" data-edit="lightAnimation.${customPropertyObject.varName}">
                        </div>`)
                    if (animateShow) {
                        customPropertyEl.hide();
                    }
                    customPropertySibling.after(customPropertyEl);
                    if (animateShow) {
                        customPropertyEl.show('normal');
                    }
                    break;
                case "range":
                    var customPropertyEl = $(
                    `<div class="form-group community-lighting-custom-property">
                        <label>${customPropertyObject.title}</label>
                        <div class="form-fields">
                            <input type="range" name="lightAnimation.${customPropertyObject.varName}" value="${currentValue}" min="${customPropertyObject.min}" max="${customPropertyObject.max}" step="${customPropertyObject.step}" data-dtype="Number">
                            <span class="range-value">${currentValue}</span>
                        </div>
                    </div>`);
                    if (animateShow) {
                        customPropertyEl.hide();
                    }
                    customPropertySibling.after(customPropertyEl);
                    if (animateShow) {
                        customPropertyEl.show('normal');
                    }
                    break;
                case "checkbox":
                    var customPropertyEl = 
                    $(
                    `<div class="form-group community-lighting-custom-property">
                        <label>${customPropertyObject.title}</label>
                        <input type="checkbox" name="lightAnimation.${customPropertyObject.varName}" data-dtype="Boolean" ${currentValue?"checked":""}>
                    </div>`);
                    if (animateShow) {
                        customPropertyEl.hide();
                    }
                    customPropertySibling.after(customPropertyEl);
                    if (animateShow) {
                        customPropertyEl.show('normal');
                    }
                    
                    break;
                case "select":
                    var options = '';
                    customPropertyObject.options.forEach(option => {
                        options+=`<option value="${option.value}"${option.value == currentValue?"selected":""}>${option.label}</option>`;
                    })
                    var customPropertyEl = $(
                    `<div class="form-group community-lighting-custom-property">
                        <label>${customPropertyObject.title}</label>
                        <div class="form-fields">
                            <select name="lightAnimation.${customPropertyObject.varName}">
                                ${options}
                            </select>
                        </div>
                    </div>`);
                    if (animateShow) {
                        customPropertyEl.hide();
                    }
                    customPropertySibling.after(customPropertyEl);
                    if (animateShow) {
                        customPropertyEl.show('normal');
                    }
                    
                    break;
                case "image":
                    var customPropertyEl = 
                    $(`
                    <div class="form-group community-lighting-custom-property">
                        <label>${customPropertyObject.title}</label>
                        <div class="form-fields">
                            <button type="button" class="file-picker" data-type="imagevideo" data-target="lightAnimation.${customPropertyObject.varName}" title="Browse Files" tabindex="-1">
                                <i class="fas fa-file-import fa-fw"></i>
                            </button>
                            <input id="community-lighting-custom-image" class="image" type="text" name="lightAnimation.${customPropertyObject.varName}" placeholder="path/image.png" value="${currentValue}">
                        </div>
                    </div>`)

                    if (animateShow) {
                        customPropertyEl.hide();
                    }
                    customPropertySibling.after(customPropertyEl);
                    if (animateShow) {
                        customPropertyEl.show('normal');
                    }
                    
                    break;

                default:
                    break;
            }
        })
    }

    static async addOptGroups(html) {
        // Find all start/end separators, get elements between and wrap them in an optgroup
        html.find("[value$='CommunityLightingSeparatorStart']").each((index, element) => {
            html.find(`[value='${element.innerText}CommunityLightingSeparatorStart']`).nextUntil(`[value='${element.innerText}CommunityLightingSeparatorEnd']`).wrapAll(`<optgroup label="${element.innerText}"></optgroup>`);
        });
        // Remove all original separators
        html.find("[value$='CommunityLightingSeparatorStart']").remove();
        html.find("[value$='CommunityLightingSeparatorEnd']").remove();
    }

    static async onRenderTokenOrLightConfig(objectConfig, html, data) {
        var isToken = false;
        if (objectConfig.object.light) {
            isToken = true;
        }
        var animTypeSelector = html.find("[name='lightAnimation.type']"); // Get the animation type selector element
        var customPropertySibling = html.find('[name="lightAnimation.intensity"]').parent().parent(); // Get the div holding the intensity slider so we can add our props after it
        CLCustomPropertyManager.addOptGroups(html);

        // Grab the current value, and set any custom properties up
        var customAnimationProperties = CONFIG.Canvas.lightAnimations[animTypeSelector.val()]?.customProperties;

        CLCustomPropertyManager.removeAllCustomProperties(html);

        if (customAnimationProperties && customAnimationProperties.length > 0) {
            CLCustomPropertyManager.addCustomProperties(objectConfig, customPropertySibling, customAnimationProperties, animTypeSelector.val(), isToken);
            objectConfig.activateListeners(html);
        }

        // When the type changes, set up any custom properties
        var activateListenersTimeout;
        animTypeSelector.on('change', await function () {
            CLCustomPropertyManager.removeAllCustomProperties(html);
            customAnimationProperties = CONFIG.Canvas.lightAnimations[this.value]?.customProperties;
            if (customAnimationProperties && customAnimationProperties.length > 0) {
                CLCustomPropertyManager.addCustomProperties(objectConfig, customPropertySibling, CONFIG.Canvas.lightAnimations[this.value].customProperties, this.value, isToken, true);
                // TODO: Disabled as it causes animations to change, but not shaders. If we can force a shader change, all the better...
                if(!isToken){
                    this.disabled = true;
                    if(activateListenersTimeout){
                        clearTimeout(activateListenersTimeout);
                    }
                    activateListenersTimeout = setTimeout(() => {
                        objectConfig.activateListeners(html);
                        var fd = new FormDataExtended(objectConfig.form);
                        objectConfig.object.data = mergeObject(objectConfig.object.data, fd.toObject(), {inplace: false});
                        objectConfig.object.updateSource();
                        objectConfig.object.refresh();
                        this.disabled = false;
                    }, 500);
                }
            }
        });
    }

    static onUpdateLightOrToken(scene, object, changes, diff){
        if(changes.lightAnimation && !diff.loadedProperty && !diff.colorForce){ // Only attempt to save if the lightAnimation prop has changed
            CLCustomPropertyManager.saveCustomProperties(object, changes);
        }
    }

}