class CLAnimationManager {
    communityAnimations;

    constructor() {
        this.communityAnimations = new CLAnimations();
        Hooks.on("renderTokenConfig", CLCustomPropertyManager.onRenderTokenOrLightConfig);
        Hooks.on("renderLightConfig", CLCustomPropertyManager.onRenderTokenOrLightConfig);
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
        await function () {
            for (var author in customLightsObject) {
                animations[`${author}CommunityLightingSeparatorStart`] = {
                    label: `${author}`
                }
                let lightsArray = customLightsObject[author].lights;
                lightsArray?.forEach(light => {
                    animations[`${author}${light.name}`] = {
                        label: light.name,
                        animation: this.communityAnimations.masterAnimation, // Use masterAnimation, include animationName
                        illuminationShader: CLAnimationManager.getShaderClass(light.shaders?.illumination) || CLStandardIlluminationShader,
                        colorationShader: CLAnimationManager.getShaderClass(light.shaders?.coloration) || CLStandardColorationShader
                    }

                    if (!light.customProperties) {
                        light.customProperties = [];
                    }
                    light.customProperties.push({
                        "default": light.animationFunction,
                        "type": "animationName"
                    }, 
                    {
                        "title": "Light Circle Smoothness",
                        "varName": "smoothness",
                        "type": "range",
                        "min": 0,
                        "max": 100,
                        "step": 1,
                        "default": 0,
                        "supports": "blur"
                    },
                    {
                        "title": "Use Gobo",
                        "varName": "useGobo",
                        "type": "checkbox",
                        "default": false,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Image",
                        "varName": "goboTexture",
                        "type": "image",
                        "default": "",
                        "supports": "gobo"
                    }, 
                    {
                        "title": "Invert Gobo",
                        "varName": "invert",
                        "type": "checkbox",
                        "default": false,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Type",
                        "varName": "goboType",
                        "type": "select",
                        "options": [
                           {
                               "label": "Standard",
                               "value": 0.0
                           },
                           {
                               "label": "Colored",
                               "value": 1.0
                           },
                           {
                               "label": "Silhouette",
                               "value": 2.0
                           }
                        ],
                        "default": 0.0,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Rotation",
                        "varName": "rotation",
                        "type": "range",
                        "min": -180,
                        "max": 180,
                        "step": 1,
                        "default": 0,
                        "supports": "gobo"
                    }, {
                        "title": "Gobo Scale",
                        "varName": "scale",
                        "type": "range",
                        "min": 0.1,
                        "max": 3.0,
                        "step": 0.1,
                        "default": 1.0,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Stretch Width",
                        "varName": "stretchX",
                        "type": "range",
                        "min": 0.1,
                        "max": 2.0,
                        "step": 0.1,
                        "default": 1.0,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Stretch Height",
                        "varName": "stretchY",
                        "type": "range",
                        "min": 0.1,
                        "max": 2.0,
                        "step": 0.1,
                        "default": 1.0,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Translate Horizontal",
                        "varName": "translateX",
                        "type": "range",
                        "min": -1.0,
                        "max": 1.0,
                        "step": 0.01,
                        "default": 0.0,
                        "supports": "gobo"
                    },
                    {
                        "title": "Gobo Translate Vertical",
                        "varName": "translateY",
                        "type": "range",
                        "min": -1.0,
                        "max": 1.0,
                        "step": 0.01,
                        "default": 0.0,
                        "supports": "gobo"
                    }
                    );
                    animations[`${author}${light.name}`].customProperties = light.customProperties;

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
        if (!name) {
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