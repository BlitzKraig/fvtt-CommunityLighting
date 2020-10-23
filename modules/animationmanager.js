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
        await
        function () {
            animations[`CommunityLightingSeparatorBaseStart`] = {
                label: `==== ⬇ CommunityLighting ⬇ ====`
            }
            for (var author in customLightsObject) {
                animations[`${author}CommunityLightingSeparator`] = {
                    label: `---- ⬇ Author: ${author} ⬇ ----`
                }
                let lightsArray = customLightsObject[author].lights;
                lightsArray?.forEach(light => {
                    animations[`${author}${light.name}`] = {
                        label: light.name,
                        animation: this.communityAnimations[light.animationFunction],
                        illuminationShader: CLAnimationManager.getShaderClass(light.shaders?.illumination) || StandardIlluminationShader,
                        colorationShader: CLAnimationManager.getShaderClass(light.shaders?.coloration) || StandardColorationShader
                    }
                });
            }
        }.call(this);
        animations[`CommunityLightingSeparatorBaseEnd`] = {
            label: `==== ⬆ CommunityLighting ⬆ ====`
        }
        await this.addAnimations(animations);
    }

    static _cls_ = {}; // cache
    static getShaderClass(name) {
        if(!name){
            return false;
        }
        if (!CLAnimationManager._cls_[name]) {
            if (name.match(/^[a-zA-Z0-9_]+$/)) {
                CLAnimationManager._cls_[name] = eval(name);
            } else {
                console.error(`CommunityLighting Error: Shader "${name}" not valid`);
                return false;
            }
        }
        return CLAnimationManager._cls_[name];
    }
}