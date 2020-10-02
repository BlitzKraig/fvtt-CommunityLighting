class CLAnimationManager {
    communityAnimations;

    constructor() {
        this.communityAnimations = new CLAnimations();
    }
    
    async addAnimations(animations) {
        CONFIG.Canvas.lightAnimations = mergeObject(CONFIG.Canvas.lightAnimations, animations);
    }

    async getCommunityLights() {
        const src = '/modules/CommunityLighting/lights.json'
        const resp = await fetch(src);
        if (resp.status !== 200) {
            console.warn(`Unable to load community lighting file: ${src}`);
            return {};
        }
        return resp.json().then(json => {
            console.log(`Loaded community lighting file: ${src}`);
            return json;
        }).catch(err => {
            console.error(`Unable to parse community lighting file: ${err}`);
            return {};
        });
    }

    async registerAnimations() {
        let customLightsObject = await this.getCommunityLights();
        let animations = {};
        await function () {
            for (var author in customLightsObject) {
                let lightsArray = customLightsObject[author].lights;
                lightsArray.forEach(light => {
                    animations[`${author}${light.name}`] = {
                        label: light.name,
                        animation: this.communityAnimations[light.shaderName]
                    }
                });
            }
        }.call(this);

        await this.addAnimations(animations);
    }
}