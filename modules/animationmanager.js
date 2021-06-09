class CLAnimationManager {
    communityAnimations;

    constructor() {
        this.communityAnimations = new CLAnimations();
        Hooks.on("renderTokenConfig", CLCustomPropertyManager.onRenderTokenOrLightConfig);
        Hooks.on("renderLightConfig", CLCustomPropertyManager.onRenderTokenOrLightConfig);
        Hooks.on("preUpdateAmbientLight", CLCustomPropertyManager.onPreUpdateLightOrToken);
        Hooks.on("preUpdateToken", CLCustomPropertyManager.onPreUpdateLightOrToken);
        Hooks.on("updateAmbientLight", CLCustomPropertyManager.onUpdateLightOrToken);
        Hooks.on("updateToken", CLCustomPropertyManager.onUpdateLightOrToken);
    }

    async addAnimations(animations) {
        CONFIG.Canvas.lightAnimations = mergeObject(CONFIG.Canvas.lightAnimations, animations);
    }

    async getCommunityLights() {
        const src = ROUTE_PREFIX?`/${ROUTE_PREFIX}/modules/CommunityLighting/lights.json`:'/modules/CommunityLighting/lights.json';
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
            for (var author in customLightsObject) {
                animations[`${author}CommunityLightingSeparatorStart`] = {
                    label: `${author}`
                }
                let lightsArray = customLightsObject[author].lights;
                lightsArray?.forEach(light => {
                    animations[`${author}${light.name}`] = {
                        label: light.name,
                        animation: this.communityAnimations[light.animationFunction],
                        illuminationShader: CLAnimationManager.getShaderClass(light.shaders?.illumination) || StandardIlluminationShader,
                        colorationShader: CLAnimationManager.getShaderClass(light.shaders?.coloration) || StandardColorationShader
                    }
                    if (!light.customProperties) {
                        light.customProperties = [];
                    }
                    light.customProperties.push(
                    {
                        "default": light.speedDescription,
                        "type": "speedDescription"
                    },
                    {
                        "default": light.intensityDescription,
                        "type": "intensityDescription"
                    })
                    if(light.customProperties){
                        animations[`${author}${light.name}`].customProperties = light.customProperties;
                    }
                });
                animations[`${author}CommunityLightingSeparatorEnd`] = {
                    label: `${author}`
                }
            }
        }.call(this);
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