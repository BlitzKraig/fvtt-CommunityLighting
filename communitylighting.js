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
        
    }
}


Hooks.on("init", CommunityLighting.onInit);