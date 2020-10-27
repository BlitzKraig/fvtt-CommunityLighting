class CLCustomPropertyManager {

    static async removeAllCustomProperties(html) {
        html.find(".community-lighting-custom-property").hide('normal', function () {
            $(this).remove();
        });
    }

    static async addCustomProperties(objectConfig, customPropertySibling, customAnimationProperties, animateShow = false) {

        // TODO: Save custom values to flags
        // Grab custom values from flags, and update the lights with them
        // This ^ needs to be done before now. Flag values should be loaded and added to lights without opening the config

        // Foreach light, if light.getFlag("CommunityLighting", "customProps") mergeObject(light.animation, customProps) // Something like that...

        var isToken = false;
        if (objectConfig.object.light) {
            isToken = true;
        }

        // Delete unused props when changing type. Maybe not needed, and needs fixed
        // if(isToken){
        //     Object.keys(objectConfig.object.light.animation).forEach(key=>{
        //         if(key != "type" && key != "intensity" && key != "speed"){
        //             if(!customAnimationProperties.find(prop=>{return prop.varName == key})){
        //                 delete objectConfig.object.light.animation[key];
        //             }
        //         }
        //     });
        // }else{
        //     Object.keys(objectConfig.object.source.animation).forEach(key=>{
        //         if(key != "type" && key != "intensity" && key != "speed"){
        //             if(!customAnimationProperties.find(prop=>{return prop.varName == key})){
        //                 delete objectConfig.object.source.animation[key];
        //             }
        //         }
        //     });
        // }


        var customAnimationPropertiesClone = JSON.parse(JSON.stringify(customAnimationProperties)); // Clone object so we can reverse it without reversing original
        
        customAnimationPropertiesClone.reverse().forEach((customPropertyObject) => {
            if (isToken) {
                var currentValue = objectConfig.object.light.animation[customPropertyObject.varName] || customPropertyObject.default;
            } else {
                var currentValue = objectConfig.object.source.animation[customPropertyObject.varName] || customPropertyObject.default;
            }
            switch (customPropertyObject.type) {
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
                        <input type="checkbox" name="lightAnimation.${customPropertyObject.varName}" data-dtype="Boolean" checked="${currentValue}">
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
                        options+=`<option value="${option.value}">${option.label}</option>`;
                    })
                    var customPropertyEl = $(
                    `<div class="form-group community-lighting-custom-property">
                        <label>${customPropertyObject.title}</label>
                        <div class="form-fields">
                            <select name="lightAnimation.${customPropertyObject.varName}">
                                <option value="">None</option>${options}
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
        var animTypeSelector = html.find("[name='lightAnimation.type']"); // Get the animation type selector element
        var customPropertySibling = html.find('[name="lightAnimation.intensity"]').parent().parent(); // Get the div holding the intensity slider so we can add our props after it
        CLCustomPropertyManager.addOptGroups(html);
        // Grab the current value, and set any custom properties up
        var customAnimationProperties = CONFIG.Canvas.lightAnimations[animTypeSelector.val()]?.customProperties;

        CLCustomPropertyManager.removeAllCustomProperties(html);

        if (customAnimationProperties && customAnimationProperties.length > 0) {
            CLCustomPropertyManager.addCustomProperties(objectConfig, customPropertySibling, customAnimationProperties);
        }

        // When the type changes, set up any custom properties
        animTypeSelector.on('change', function () {
            CLCustomPropertyManager.removeAllCustomProperties(html);
            customAnimationProperties = CONFIG.Canvas.lightAnimations[this.value]?.customProperties;
            if (customAnimationProperties && customAnimationProperties.length > 0) {
                CLCustomPropertyManager.addCustomProperties(objectConfig, customPropertySibling, CONFIG.Canvas.lightAnimations[this.value].customProperties, true);
            }
        });
    }

}