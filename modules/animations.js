// Setup intellisense for deps
/// <reference path="../dependencies/chroma.min.js"/>
/// <reference path="../dependencies/pixi-filters.js"/>

class CLAnimations {

    constructor() {
        Hooks.on("initializePointSourceShaders", CLPreAnimation.onPointSourceInit);
    }

    /* Author: Global - Core helper - Normally used with custom shaders */
    foundryTime = PointSource.prototype.animateTime
    /* Global End */

    /* Author: Blitz */

    // Not in use: example only
    blitzPulseTest(dt, {
        speed = 5,
        intensity = 5
    }) {

        // Cosine wave
        const di = 1;
        const ms = 30000 / speed;
        const da = (2 * Math.PI) * ((60 * dt) / ms);
        const a = this._pulseAngle = (this._pulseAngle ?? 0) + da;
        const delta = (Math.cos(a) + 1) / 2;

        // Evolve illumination
        const iu = this.illumination.uniforms;
        const r = this.bright / this.dim;
        const min = (1 - di) * r;
        iu.ratio = (delta * min) + ((1 - delta) * r);
        iu.alpha = (delta * 0.75) + (1 - delta);

        // Evolve coloration
        const cu = this.coloration.uniforms;
        const cMin = this.alpha / 2;
        cu.alpha = (delta * cMin) + ((1 - delta) * this.alpha);

        // Switch direction
        if (a > (2 * Math.PI)) this._pulseAngle = 0;

    }

    blitzShaderTest(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.addIlluminationBlur(this, 20);
        CLAnimationHelpers.addColorationBlur(this, 20, 10);
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, speed, intensity);

        CLAnimationHelpers.cosineWave(this, speed, 6, dt);
        this.coloration.filters[0].blur = 100 * this._wave.simplifiedValue;
        this.illumination.uniforms.alpha = this._wave.invertedSimplifiedValue;
    }

    blitzFadeSimple(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.cosineWave(this, speed, intensity, dt);
        CLAnimationHelpers.cachePlaceable(this);

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
        }

        this.illumination.uniforms.alpha = this._wave.invertedSimplifiedValue;
        this.coloration.uniforms.alpha = this._wave.invertedSimplifiedValue * this._originalColorAlpha;
    }

    blitzLightningSimple(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Use binaryRandomInterval to flip on at random
        // light, speed, delay before attempting to flip, frame-range light can remain flipped 'on'
        CLAnimationHelpers.binaryFlashRandomInterval(this, speed, dt, 50, [1, 10]);
        CLAnimationHelpers.cachePlaceable(this);

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
        }

        if (this._flipped) {
            // Set the alpha somewhere between 0.1 and 1, depending on intensity
            let alpha = 0.1 * intensity;
            this.illumination.uniforms.alpha = alpha;
            this.coloration.uniforms.alpha = this._originalColorAlpha; // Don't bother multiplying this with alpha, users can use the opacity slider to set this directly, since the light only has 2 phases
        } else {
            // Set the alpha to zero
            this.illumination.uniforms.alpha = 0;
            this.coloration.uniforms.alpha = 0;
        }
    }

    blitzElectricFault(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Use binaryRandomInterval to flip on at random
        // light, speed, delay before attempting to flip, frame-range light can remain flipped 'on'
        CLAnimationHelpers.binaryFlashRandomInterval(this, speed, dt, 50, [1, 10]);
        CLAnimationHelpers.cachePlaceable(this);

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
        }

        if (this._flipped) {
            // Set the alpha somewhere between 0 and 0.9, depending on intensity
            let alpha = 1 - (0.1 * intensity);
            this.illumination.uniforms.alpha = alpha;
            this.coloration.uniforms.alpha = this._originalColorAlpha - (this._originalColorAlpha * (0.1 * intensity)); // Don't bother multiplying this with alpha, users can use the opacity slider to set this directly, since the light only has 2 phases
        } else {
            // Set the alpha to full
            this.illumination.uniforms.alpha = 1;
            this.coloration.uniforms.alpha = this._originalColorAlpha;
        }
    }

    // Based on the 0.7 beta torch
    blitzTorch(dt, {
        speed = 5,
        intensity = 5
    }) {


        CLAnimationHelpers.binaryTimer(this, speed, dt);
        CLAnimationHelpers.cosineWave(this, speed, intensity, dt);
        CLAnimationHelpers.cachePlaceable(this);

        // Cause the torch to flicker by not changing every frame
        const t = Date.now();
        const targetMS = (0.5 + (Math.random() / 2)) * (10 - speed) * 16;

        const iu = this.illumination.uniforms;
        const cu = this.coloration.uniforms;

        this._originalColor = hexToRGB(this.color);

        if ((t - this._animTime) < targetMS) {
            var alteredValue = Math.random() * 0.001;
            if (this._flipped) {
                iu.ratio -= alteredValue;
                iu.alpha -= alteredValue;
                cu.alpha -= alteredValue;
            } else {
                iu.ratio += alteredValue;
                iu.alpha += alteredValue;
                cu.alpha += alteredValue;
            }
            return;
        }
        this._animTime = t;

        // Evolve illumination
        iu.ratio = this._ar1(iu.ratio, {
            center: this.bright / this.dim,
            sigma: 0.002 * intensity
        });
        iu.alpha = this._ar1(iu.alpha, {
            center: 0.9,
            sigma: 0.005 * intensity,
            max: 1.0
        });

        // Evolve coloration
        cu.alpha = this._ar1(cu.alpha, {
            center: this.alpha,
            sigma: 0.005 * intensity
        });
        cu.color.forEach((channel, index) => {
            cu.color[index] = this._originalColor[index] + ((1 - this._originalColor[index]) * this._wave.simplifiedValue / 2); // Bring the color closer to bright white
        });
    }

    // Ensure blur is added, then run blitzTorch. This should later be possible using Advanced Lighting Toolkit
    blitzTorchBlur(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.addIlluminationBlur(this, 20);
        CLAnimationHelpers.includeAnimation(this, "blitzTorch", dt, speed, intensity);
    }


    blitzSimpleFlash(dt, {
        speed = 5,
        intensity = 5
    }) {

        CLAnimationHelpers.binaryTimer(this, speed, dt);
        CLAnimationHelpers.cachePlaceable(this);

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
        }

        var minColorAlpha = this._originalColorAlpha - (this._originalColorAlpha / 10 * intensity);
        minColorAlpha = parseFloat(minColorAlpha.toFixed(2));

        if (this._flipped) {
            // Set the alpha somewhere between 0 and 0.9, depending on intensity
            let alpha = 1 - (0.1 * intensity);
            alpha = parseFloat(alpha.toFixed(2));
            this.illumination.uniforms.alpha = alpha;
            this.coloration.uniforms.alpha = minColorAlpha;
        } else {
            // Set the alpha to full
            this.illumination.uniforms.alpha = 1;
            this.coloration.uniforms.alpha = this._originalColorAlpha;
        }
    }

    blitzRGBFlash(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Track _flipped value at start of cycle
        let flipped = this._flipped;

        CLAnimationHelpers.forceColorationShader(this, "#ff0000");
        CLAnimationHelpers.includeAnimation(this, "blitzSimpleFlash", dt, speed, intensity); // Run blitzSimpleFlash

        // Only run if _flipped is false, and has changed in this cycle
        if (flipped && !this._flipped) {
            let color = this.coloration.uniforms.color;
            switch (color.toString()) {
                case "1,0,0":
                    color = [0, 1, 0];
                    break;
                case "0,1,0":
                    color = [0, 0, 1];
                    break;
                case "0,0,1":
                    color = [1, 0, 0]
                    break;
                default:
                    color = [1, 0, 0];
                    break;
            }
            this.coloration.uniforms.color = color;
        }
    }

    blitzPoliceFlash(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Track _flipped value at start of cycle
        let flipped = this._flipped;
        CLAnimationHelpers.forceColorationShader(this, "#ff0000");
        CLAnimationHelpers.includeAnimation(this, "blitzSimpleFlash", dt, speed, intensity); // Run blitzSimpleFlash

        // Only run if _flipped is false, and has changed in this cycle
        if (flipped && !this._flipped) {
            this.coloration.uniforms.ratio = 1;
            let color = this.coloration.uniforms.color;
            switch (color.toString()) {
                case "1,0,0":
                    color = [0, 0, 1];
                    break;
                case "0,0,1":
                    color = [1, 0, 0]
                    break;
                default:
                    color = [1, 0, 0];
                    break;
            }
            this.coloration.uniforms.color = color;
            // Set the alpha to full
            this.illumination.uniforms.alpha = 1;
            this.coloration.uniforms.alpha = this._originalColorAlpha;
        }
    }

    /* Author: SecretFire */
    secretFireAnimateTimeForceColor(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.forceColorationShader(this, '#ff0000'); // Force the lights tintColor to Red if the user has not set one
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, speed, intensity); // Call `foundryTime` to manipulate the custom shaders based on time
    }

    // Your Lighting Code Here ⬆
    // Precede your code with /* Author: Authorname */
}