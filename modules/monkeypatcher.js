class CLMonkeyPatcher {

    static libWrapped = false;

    static checkLibWrapper() {
        const lwrapper = game.modules.get("lib-wrapper");
        if (!lwrapper?.active && game.user.isGM) {
            ui.notifications.warn(game.i18n.localize("COMMUNITYLIGHTING.notif.libWrapperMissing"));
        }

        if (lwrapper?.active) {
            this.libWrapped = true;
        }
    }

    static runPatches() {

        this.checkLibWrapper();

        const wrappedSoundPlay = function play(wrapped, ...args) {
            // Call base fn
            wrapped(...args);
            
            CLAudioReactor.attemptEmbiggen(this);
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
            libWrapper.register("CommunityLighting", "Sound.prototype.play", wrappedSoundPlay, "WRAPPER");
            libWrapper.register("CommunityLighting", "PointSource.prototype.animate", wrappedPointSourceAnimate, "WRAPPER");
        } else {
            const baseSoundPlay = Sound.prototype.play;
            Sound.prototype.play = function () {
                return wrappedSoundPlay.call(this, baseSoundPlay.bind(this), ...arguments);
            };

            const basePointSourceanimate = PointSource.prototype.animate;
            PointSource.prototype.animate = function () {
                return wrappedPointSourceAnimate.call(this, basePointSourceanimate.bind(this), ...arguments);
            };

        }

    }

}