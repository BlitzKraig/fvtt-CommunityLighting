class CLMonkeyPatcher {

    static runPatches(){
        const baseSoundLoad = Sound.prototype.load;

        Sound.prototype.load = async function load(...args) {
            // Call base fn
            await baseSoundLoad.call(this, ...args);
            // Connect the audio up to our gainShim
            if (CLAudioReactor.gainShim) {
                this.container.gainNode.disconnect()
                this.container.gainNode.connect(CLAudioReactor.gainShim)
            }
        };
    
        const basePointSourceAnimate = PointSource.prototype.animate;
    
        PointSource.prototype.animate = function animate(...args) {
            if(this.object.data?.lightAnimation?._source){
                this.animation = this.object.data?.lightAnimation?._source
            }
            basePointSourceAnimate.call(this, ...args)
    
            // FULL monkeypatch from SecretFire for future reference
            // const animation = this.object.data?.lightAnimation?._source || this.animation;
            // if (!animation.type || (this.radius === 0) || !this.illumination.shader) return;
            // const fn = CONFIG.Canvas.lightAnimations[animation.type]?.animation;
            // if (fn) fn.call(this, dt, animation);
        };
    }
    
}