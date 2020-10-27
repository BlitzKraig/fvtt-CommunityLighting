class CLCustomPropertyManager {
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
        CLCustomPropertyManager.addOptGroups(html);
    }
}