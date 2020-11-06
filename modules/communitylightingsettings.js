class CommunityLightingSettings extends FormApplication {
    constructor(...args) {
        super(...args);
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("COMMUNITYLIGHTING.settings.title");
        options.id = "community-lighting-settings";
        options.template = "modules/CommunityLighting/templates/settings.html";
        return options;
    }

    async getData() {
        let data = {};
        const src = ROUTE_PREFIX?`/${ROUTE_PREFIX}/modules/CommunityLighting/lights.json`:'/modules/CommunityLighting/lights.json';
        const resp = await fetch(src);
        if (resp.status !== 200) {
            console.warn(`Unable to load community lighting file: ${src}`);
        }
        let tempAuthorsObj = await resp.json().then(json => {
            console.log(`Loaded community lighting file: ${src}`);
            return json;
        }).catch(err => {
            console.error(`Unable to parse community lighting file: ${err}`);
            return {};
        });
        if(tempAuthorsObj){
            data.authors = Object.keys(tempAuthorsObj);
        }
        return data;
    }
}