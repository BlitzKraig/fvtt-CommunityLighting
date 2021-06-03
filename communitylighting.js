/**
 * Community Lighting by Blitz
 * Lighting animations for 0.7.x
 */

class CommunityLighting {

    static moduleName = "CommunityLighting"

    static animationManager;

    static handlebarsHelpers = {
        "communitylighting-parseauthors": (obj) => {
            var authors = Object.keys(obj);
            var data = "";
            authors.forEach((author)=>{
                data+=`<p>${author}</p>
                `;
            })
            return data;
        }
    }

    static async onInit() {

        // Get all community lights
        // Add settings to disable specific lights from selection

        CommunityLighting.animationManager = new CLAnimationManager();
        await CommunityLighting.animationManager.registerAnimations();

        game.settings.registerMenu(CommunityLighting.moduleName, "mySettingsMenu", {
            name: "COMMUNITYLIGHTING.settings.name",
            label: "COMMUNITYLIGHTING.settings.label",
            icon: "fas fa-lightbulb",
            type: CommunityLightingSettings,
            restricted: true
        });

        Handlebars.registerHelper(CommunityLighting.handlebarsHelpers);

        const baseSoundLoad = Sound.prototype.load;

        Sound.prototype.load = async function load(...args) {
            console.log(this);
            // Call base fn
            await baseSoundLoad.call(this, ...args);
            if (CLAudioReactor.gainShim) {
                this.container.gainNode.disconnect()
                this.container.gainNode.connect(CLAudioReactor.gainShim)
            }
        };

        PointSource.prototype.animate = function animate(dt) {
            const animation = this.object.data?.lightAnimation?._source || this.animation;
            if (!animation.type || (this.radius === 0) || !this.illumination.shader) return;
            const fn = CONFIG.Canvas.lightAnimations[animation.type]?.animation;
            if (fn) fn.call(this, dt, animation);
        };

    }
}


Hooks.on("init", CommunityLighting.onInit);