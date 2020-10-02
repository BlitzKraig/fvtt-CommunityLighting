class CLAnimations {

    // Blitz
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

    blitzTorch(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Cause the torch to flicker by not changing every frame
        const t = Date.now();
        const targetMS = (0.5 + (Math.random() / 2)) * (10 - speed) * 16;
        if ((t - this._animTime) < targetMS) return;
        this._animTime = t;

        // Evolve illumination
        const iu = this.illumination.uniforms;
        iu.ratio = this._ar1(iu.ratio, {
            center: this.bright / this.dim,
            sigma: 0.002 * intensity
        });
        iu.alpha = this._ar1(iu.alpha, {
            center: 0.9,
            sigma: 0.01 * intensity,
            max: 1.0
        });

        // Evolve coloration
        const cu = this.coloration.uniforms;
        cu.alpha = this._ar1(cu.alpha, {
            center: this.alpha,
            sigma: 0.01 * intensity
        });
    }

    blitzSimpleFlash(dt, {
        speed = 5,
        intensity = 5
    }) {

        // Check flipped value at start
        let flipped = this._flipped;
        CLAnimationHelpers.binaryTimer(this, speed);

        var minColorAlpha = this._originalColorAlpha - (this._originalColorAlpha / 10 * intensity);
        minColorAlpha = parseFloat(minColorAlpha.toFixed(2));

        // These two checks ensure we respect the Opacity slider in lights
        if (!this._originalColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }
        // If the opacity slider is changed, it will be an unexpected value. Reset our original tracker if so
        if (this.coloration.uniforms.alpha != this._originalColorAlpha && this.coloration.uniforms.alpha != minColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }

        // Only run if we have flipped this frame
        if (flipped != this._flipped) {
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
    }

    blitzRGBFlash(dt, {
        speed = 5,
        intensity = 5
    }) {
        let flipped = this._flipped;
        CLAnimationHelpers.binaryTimer(this, speed);

        var minColorAlpha = this._originalColorAlpha - (this._originalColorAlpha / 10 * intensity);
        minColorAlpha = parseFloat(minColorAlpha.toFixed(2));

        // These two checks ensure we respect the Opacity slider in lights
        if (!this._originalColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }
        // If the opacity slider is changed, it will be an unexpected value. Reset our original tracker if so
        if (this.coloration.uniforms.alpha != this._originalColorAlpha && this.coloration.uniforms.alpha != minColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }

        // Only run if we have flipped this frame
        if (flipped != this._flipped) {
            if (this._flipped) {
                // Set the alpha somewhere between 0 and 0.9, depending on intensity
                let alpha = 1 - (0.1 * intensity);
                alpha = parseFloat(alpha.toFixed(2));
                this.illumination.uniforms.alpha = alpha;
                this.coloration.uniforms.alpha = minColorAlpha;
            } else {
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
                // Set the alpha to full
                this.illumination.uniforms.alpha = 1;
                this.coloration.uniforms.alpha = this._originalColorAlpha;
            }
        }

    }

    blitzPoliceFlash(dt, {
        speed = 5,
        intensity = 5
    }) {
        let flipped = this._flipped;
        CLAnimationHelpers.binaryTimer(this, speed);

        var minColorAlpha = this._originalColorAlpha - (this._originalColorAlpha / 10 * intensity);
        minColorAlpha = parseFloat(minColorAlpha.toFixed(2));

        // These two checks ensure we respect the Opacity slider in lights
        if (!this._originalColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }
        // If the opacity slider is changed, it will be an unexpected value. Reset our original tracker if so
        if (this.coloration.uniforms.alpha != this._originalColorAlpha && this.coloration.uniforms.alpha != minColorAlpha) {
            this._originalColorAlpha = this.coloration.uniforms.alpha;
        }

        if (flipped != this._flipped) {
            if (this._flipped) {
                this.coloration.uniforms.ratio = 0.5
                // Set the alpha somewhere between 0 and 0.9, depending on intensity
                let alpha = 1 - (0.1 * intensity);
                alpha = parseFloat(alpha.toFixed(2));
                this.illumination.uniforms.alpha = alpha;
                this.coloration.uniforms.alpha = minColorAlpha;
            } else {
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

    }

    // Your Lighting Code Here

}