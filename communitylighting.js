/**
 * Community Lighting by Blitz
 * Lighting animations for 0.7.x
 */

class CommunityLighting {

    static moduleName = "CommunityLighting"

    static async onInit() {

        // Get all community lights
        // Add settings to disable specific lights from selection

        CONFIG.debug.hooks = true;
    
        let animationManager = new CLAnimationManager();
        await animationManager.registerAnimations();

        game.settings.registerMenu(CommunityLighting.moduleName, "mySettingsMenu", {
            name: "COMMUNITYLIGHTING.settings.name",
            label: "COMMUNITYLIGHTING.settings.label",
            icon: "fas fa-lightbulb",
            type: CommunityLightingSettings,
            restricted: true
        });
    }
}


Hooks.on("init", CommunityLighting.onInit);