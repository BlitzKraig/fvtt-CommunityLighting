class CLMonkeyPatcher {

    static libWrapped = false;

    static checkLibWrapper() {
        if (!game.modules.get("lib-wrapper")?.active && game.user.isGM) {
            ui.notifications.warn("Community Lighting recommends to install and activate the 'libWrapper' module.");
        } else this.libWrapped = true;
    }

    static runPatches() {

        this.checkLibWrapper();

        const wrappedSoundLoad = async function load(wrapped, ...args) {
            // Call base fn
            await wrapped(...args);
            // Connect the audio up to our gainShim
            if (CLAudioReactor.gainShim) {
                this.container.gainNode.disconnect()
                this.container.gainNode.connect(CLAudioReactor.gainShim)
            }
        };

        const wrappedPointSourceAnimate = function animate(wrapped, ...args) {
            // saving animation
            const animation = this.animation;
            if (this.object.data?.lightAnimation?._source) {
                // replacing animation values by CL animation
                this.animation = this.object.data?.lightAnimation?._source;
            }
            wrapped(...args);
            // restore animation
            this.animation = animation;
        };

        if (this.libWrapped) {
            libWrapper.register("CommunityLighting", "Sound.prototype.load", wrappedSoundLoad, "WRAPPER");
            libWrapper.register("CommunityLighting", "PointSource.prototype.animate", wrappedPointSourceAnimate, "WRAPPER");
        } else {
            const baseSoundLoad = Sound.prototype.load;
            Sound.prototype.load = async function () {
                return await wrappedSoundLoad.call(this, baseSoundLoad.bind(this), ...arguments);
            };

            const basePointSourceanimate = PointSource.prototype.animate;
            PointSource.prototype.animate = function () {
                return wrappedPointSourceAnimate.call(this, basePointSourceanimate.bind(this), ...arguments);
            };

        }

    }

}