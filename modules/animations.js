// Setup intellisense for deps
/// <reference path="../dependencies/chroma.min.js"/>
/// <reference path="../dependencies/pixi-filters.js"/>

class CLAnimations {

    constructor() {
        Hooks.on("initializePointSourceShaders", CLPreAnimation.onPointSourceInit);
    }

    /* Author: Global - Core helper - Normally used with custom shaders */
    foundryTime = PointSource.prototype.animateTime;
    /* Global End */

    /* Author: Blitz */

    blitzShaderTest(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.addIlluminationBlur(this, 20);
        CLAnimationHelpers.addColorationBlur(this, 20, 10);
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, {speed, intensity});

        CLAnimationHelpers.cosineWave(this, speed, 6, dt);
        this.coloration.filters[0].blur = 100 * this._wave.simplifiedValue;
        this.illumination.uniforms.alpha = this._wave.invertedSimplifiedValue;
    }

    blitzStaticBlur(dt, {
        speed = 5,
        intensity = 5,
        blurStrength = 20
    }) {
        CLAnimationHelpers.addIlluminationBlur(this, blurStrength);
    }

    blitzFadeSimple(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.cosineWave(this, speed, intensity, dt);

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
        var flipped = this._flipped;
        // Use binaryRandomInterval to flip on at random
        // light, speed, delay before attempting to flip, frame-range light can remain flipped 'on'
        CLAnimationHelpers.binaryFlashRandomInterval(this, speed, dt, 50, [1, 10]);

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
            if(flipped != this._flipped){
                // Experimental: Force light visible
                this._source.layer.sources.set(this._source.sourceId, this);
                canvas.sight.refresh();
            }
        } else {
            // Set the alpha to zero
            this.illumination.uniforms.alpha = 0;
            this.coloration.uniforms.alpha = 0;
            if(flipped != this._flipped || this._source.layer.sources.get(this._source.sourceId)){
                // Experimental: Force light fully hidden without stopping animation
                this._source.layer.sources.delete(this._source.sourceId)
                canvas.sight.refresh();
            }
        }
    }

    blitzElectricFault(dt, {
        speed = 5,
        intensity = 5
    }) {
        // Use binaryRandomInterval to flip on at random
        // light, speed, delay before attempting to flip, frame-range light can remain flipped 'on'
        CLAnimationHelpers.binaryFlashRandomInterval(this, speed, dt, 50, [1, 10]);

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
        intensity = 5,
        ratioDamper = 1,
        secondaryColor = "#f0ba5c"
    }) {
        
        CLAnimationHelpers.binaryTimer(this, speed, dt);
        CLAnimationHelpers.cosineWave(this, speed, intensity, dt);

        // Cause the torch to flicker by not changing every frame
        const t = Date.now();
        const targetMS = (0.5 + (Math.random() / 2)) * (10 - speed) * 16;

        const iu = this.illumination.uniforms;
        const cu = this.coloration.uniforms;

        if(!this._colorScale){
            this._colorScale = 0.5;
        }

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
            this._originalColor = this?._source?.data?.tintColor;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
            this._originalColor = this?._source?.data?.lightColor;
        }

        if ((t - this._animTime) < targetMS) {
            var alteredValue = Math.random() * 0.001;
            if (this._flipped) {
                iu.ratio -= alteredValue;
                iu.alpha -= alteredValue;
                cu.alpha -= alteredValue;
                if(this._originalColor && secondaryColor){
                    let colorScale = chroma.scale([this._originalColor, secondaryColor]).domain([0, 1]); // Get a color between original, secondaryColor and tertiaryColor, mapped from 0 to 1
                    this.coloration.uniforms.color = hexToRGB(colorScale(this._colorScale -= alteredValue).num()); // Set color to a color from colorScale, using full intensity cos wave to get a smooth 0 to 1 and back
                }
            } else {
                iu.ratio += alteredValue;
                iu.alpha += alteredValue;
                cu.alpha += alteredValue;
                if(this._originalColor && secondaryColor){
                    let colorScale = chroma.scale([this._originalColor, secondaryColor]).domain([0, 1]); // Get a color between original, secondaryColor and tertiaryColor, mapped from 0 to 1
                    this.coloration.uniforms.color = hexToRGB(colorScale(this._colorScale += alteredValue).num()); // Set color to a color from colorScale, using full intensity cos wave to get a smooth 0 to 1 and back
                }
            }
            return;
        }
        this._animTime = t;

        // Evolve illumination
        iu.ratio = this._ar1(iu.ratio, {
            center: this.bright / this.dim,
            sigma: (0.002 * intensity) / ratioDamper
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

        

        this._colorScale = this._ar1(this._colorScale, {
            center: 0.5,
            sigma: 0.05 * intensity,
            max: 1.0,
            min: 0.0
        })

        
        if(this._originalColor && secondaryColor){
            let colorScale = chroma.scale([this._originalColor, secondaryColor]).domain([0, 1]); // Get a color between original, secondaryColor and tertiaryColor, mapped from 0 to 1
            this.coloration.uniforms.color = hexToRGB(colorScale(this._colorScale).num()); // Set color to a color from colorScale, using full intensity cos wave to get a smooth 0 to 1 and back
        }
        // cu.color.forEach((channel, index) => {
        //     cu.color[index] = this._originalColor[index] + ((1 - this._originalColor[index]) * this._wave.simplifiedValue / 2); // Bring the color closer to bright white
        // });
    }

    // Ensure blur is added, then run blitzTorch. This should later be possible using Advanced Lighting Toolkit
    blitzTorchBlur(dt, {
        speed = 5,
        intensity = 5,
        ratioDamper = 1,
        secondaryColor = "#f0ba5c",
        blurStrength = 20
    }) {
        CLAnimationHelpers.addIlluminationBlur(this, blurStrength);
        CLAnimationHelpers.includeAnimation(this, "blitzTorch", dt, {speed, intensity, ratioDamper, secondaryColor});
    }


    blitzSimpleFlash(dt, {
        speed = 5,
        intensity = 5
    }) {

        CLAnimationHelpers.binaryTimer(this, speed, dt);

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
        CLAnimationHelpers.includeAnimation(this, "blitzSimpleFlash", dt, {speed, intensity}); // Run blitzSimpleFlash

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
        CLAnimationHelpers.includeAnimation(this, "blitzSimpleFlash", dt, {speed, intensity}); // Run blitzSimpleFlash

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

    // EXPERIMENTAL
    blitzFadeMusic(dt, {
        speed = 5,
        intensity = 5,
        listeningBand = "mid",
        gainNode = "master"
    }) {
        if(!this._currentPeak){
            this._currentPeak = 0; // store currentPeak inside the pointSource
        }
        switch (listeningBand) {
            case "low":
                listeningBand = [0,4];
                break;
            case "mid":
                listeningBand = [5,30];
                break;
            case "high":
                listeningBand = [31,63];
                break;
            case "all":
                listeningBand = undefined;
                break
        
            default:
                listeningBand = [5,30];
                break;
        }
        if(listeningBand){
            this._currentPeak = CLAnimationHelpers.getAudioFrequencyPower(this, this._currentPeak, 11 - speed, listeningBand, 1, 0.1, gainNode=="soundboard"); // Update currentPeak
        }else{
            this._currentPeak = CLAnimationHelpers.getAudioPeak(this,this._currentPeak,11 - speed, 1, 0.1, gainNode=="soundboard");
        }

        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
        }

        this._calculatedIntensity = this.ratio + (((this._currentPeak - this.ratio) / 10) * intensity);

        // Set uniforms based on currentPeak value
        this.illumination.uniforms.alpha = this._calculatedIntensity;
        this.coloration.uniforms.alpha = this._calculatedIntensity * this._originalColorAlpha;
    }

    blitzPulseMusic(dt, {
        speed = 5,
        intensity = 5,
        listeningBand = "mid",
        gainNode = "master"
    }) {
        CLAnimationHelpers.includeAnimation(this, "blitzFadeMusic", dt, {speed, intensity, listeningBand, gainNode})
        this.illumination.uniforms.ratio = this._calculatedIntensity;
    }

    blitzPulseMusicColorshift(dt, {
        speed = 5,
        intensity = 5,
        secondaryColor = '#00ff00',
        tertiaryColor = '#0000ff',
        listeningBand = "mid",
        colorSpeed = 5,
        gainNode = "master"
    }) {
        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
            this._originalColor = this?._source?.data?.tintColor;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
            this._originalColor = this?._source?.data?.lightColor;
        }
        CLAnimationHelpers.forceColorationShader(this, '#ff0000');
        CLAnimationHelpers.includeAnimation(this, "blitzPulseMusic", dt, {speed, intensity, listeningBand, gainNode});

        CLAnimationHelpers.cosineWave(this, colorSpeed, 10, dt);

        if(this._originalColor && secondaryColor && tertiaryColor){
            let colorScale = chroma.scale([this._originalColor, secondaryColor, tertiaryColor]).domain([0, 1]); // Get a color between original, secondaryColor and tertiaryColor, mapped from 0 to 1
            this.coloration.uniforms.color = hexToRGB(colorScale(this._wave.simplifiedValue).num()); // Set color to a color from colorScale, using full intensity cos wave to get a smooth 0 to 1 and back
        }
    }

    blitzForceFieldExtension(dt, {
        speed = 5,
        intensity = 5,
        secondaryColor = '#00ff00',
        useColorSpeed = true,
        colorSpeed = 5,
        colorSpeedMult = 1
    }) {
        if (this._placeableType == "AmbientLight") {
            this._originalColorAlpha = this?._source?.data?.tintAlpha;
            this._originalColor = this?._source?.data?.tintColor;
        } else if (this._placeableType == "Token") {
            this._originalColorAlpha = this?._source?.data?.lightAlpha;
            this._originalColor = this?._source?.data?.lightColor;
        }

        CLAnimationHelpers.forceColorationShader(this, '#ff0000');
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, {speed, intensity});

        CLAnimationHelpers.cosineWave(this, useColorSpeed?colorSpeed*colorSpeedMult:speed, 10, dt);

        if(this._originalColor && secondaryColor){
            let colorScale = chroma.scale([this._originalColor, secondaryColor]).domain([0, 1]); // Get a color between original and secondaryColor, mapped from 0 to 1
            this.coloration.uniforms.color = hexToRGB(colorScale(this._wave.simplifiedValue).num()); // Set color to a color from colorScale, using full intensity cos wave to get a smooth 0 to 1 and back
        }
    }

    /* Author: SecretFire */
    secretFireAnimateTimeForceColor(dt, {
        speed = 5,
        intensity = 5
    }) {
        CLAnimationHelpers.forceColorationShader(this, '#ff0000'); // Force the lights tintColor to Red if the user has not set one
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, {speed, intensity}); // Call `foundryTime` to manipulate the custom shaders based on time
    }

    secretFireAnimateStarLight(dt, {
        speed = 5,
        intensity = 5,
        secondaryColor = '#00ff00'
    }) {
        CLAnimationHelpers.forceColorationShader(this, '#ff0000'); // Force the lights tintColor to Red if the user has not set one
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, { speed, intensity }); // Call `foundryTime` to manipulate the custom shaders based on time

        this.coloration.uniforms.musicmode = false;
        this.coloration.uniforms.scolor = hexToRGB(colorStringToHex(secondaryColor));
        this.coloration.uniforms.musicwave = 1;
    }

    secretFireAnimateStarLightMusic(dt, {
        speed = 5,
        intensity = 5,
        secondaryColor = '#00ff00',
        listeningBand = "mid",
        gainNode = "master"
    }) {

        if (!this._currentPeak) {
            this._currentPeak = 0; // store currentPeak inside the pointSource
        }
        switch (listeningBand) {
            case "low":
                listeningBand = [0, 4];
                break;
            case "mid":
                listeningBand = [5, 30];
                break;
            case "high":
                listeningBand = [31, 63];
                break;
            case "all":
                listeningBand = undefined;
                break

            default:
                listeningBand = [5, 30];
                break;
        }
        if (listeningBand) {
            this._currentPeak = CLAnimationHelpers.getAudioFrequencyPower(this, this._currentPeak, 11 - speed, listeningBand, 1, 0.1, gainNode == "soundboard"); // Update currentPeak
        } else {
            this._currentPeak = CLAnimationHelpers.getAudioPeak(this, this._currentPeak, 11 - speed, 1, 0.1, gainNode == "soundboard");
        }

        CLAnimationHelpers.forceColorationShader(this, '#ff0000'); // Force the lights tintColor to Red if the user has not set one
        CLAnimationHelpers.includeAnimation(this, "foundryTime", dt, { speed, intensity }); // Call `foundryTime` to manipulate the custom shaders based on time

        this.coloration.uniforms.musicmode = true;
        this.coloration.uniforms.scolor = hexToRGB(colorStringToHex(secondaryColor));
        this.coloration.uniforms.musicwave = 1 + this._currentPeak * 2;

        // Set uniforms based on currentPeak value
        this.illumination.uniforms.alpha = 0.75 + (this._currentPeak * 0.5);
        this.illumination.uniforms.ratio = this._currentPeak;
    }

    // Your Lighting Code Here ⬆
    // Precede your code with /* Author: Authorname */
}