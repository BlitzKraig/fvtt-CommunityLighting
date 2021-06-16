class CLAnimationHelpers {

    /**
     * EXPERIMENTAL - Cache or get-cached audio analyser and return a float representing the current relative peak of playing audio
     * 
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {float} currentPeak - The current audio power peak, used to smooth between peaks
     * @param {int} smoothing - How much smoothing to apply to peak changes from 1 to 10
     * @param {float} minIncrease - How quickly the minimum decibel range slides up to meet the currently playing audio - Helps fill out the whole range
     * @param {float} maxDecrease - How quickly the maxumum decibel range slides down to meet the currently playing audio - Helps fill out the whole range
     */
    static getAudioPeak(source, currentPeak, smoothing = 5, minIncrease = 1, maxDecrease = 0.1, soundBoard = false) {
        return CLAudioReactor.getAudioPeak(source, currentPeak, smoothing, minIncrease, maxDecrease, soundBoard);
    }

    /**
     * EXPERIMENTAL - Cache or get-cached audio analyser and return a float representing the current relative peak of a frequency band
     * @deprecated
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {float} currentPeak - The current audio power peak, used to smooth between peaks
     * @param {int} smoothing - How much smoothing to apply to peak changes from 1 to 10
     * @param {Array[int]} band - 2 values from 0-63, determines the range of frequencies to analyze
     * @param {float} minIncrease - How quickly the minimum decibel range slides up to meet the currently playing audio - Helps fill out the whole range
     * @param {float} maxDecrease - How quickly the maxumum decibel range slides down to meet the currently playing audio - Helps fill out the whole range
     */
    static getAudioFrequencyPower(source, currentPeak, smoothing = 5, band = [0, 63], minIncrease = 1, maxDecrease = 0.1, soundBoard = false) {
        return CLAudioReactor.getAudioFreqPower(source, currentPeak, smoothing, band, minIncrease, maxDecrease, soundBoard);
    }


    /**
     * EXPERIMENTAL - Get the 'energy' of a listening band from 0..1
     * @param {String} listeningBand - String representation of the listening band, low, mid or high 
     * @param {Boolean} soundBoard - Should the returned value use the SoundBoard analyser
     * @returns 
     */
    static getEzFreqPower(listeningBand, soundBoard = false) {
        let newPeak = 0;
        switch (listeningBand) {
            case 'low':
                newPeak = CLAudioReactor.getEZFreqPower(0, soundBoard);
                break;
            case 'mid':
                newPeak = CLAudioReactor.getEZFreqPower(1, soundBoard);
                break;
            case 'high':
                newPeak = CLAudioReactor.getEZFreqPower(2, soundBoard);
                break;

            default:
                newPeak = CLAudioReactor.getEZFreqPower(0, soundBoard);
                break;
        }
        
        return newPeak;
    }

    /**
     * Creates and flips a _flipped flag on your light source after maxTime divided by speed. Useful for flashing animations
     * Call at the start of your animation function.
     * 
     * Usage: After using this, check `this._flipped` in your animation function, and run different code based on the result
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} speed - How quickly the phase will change. The speed variable, passed into your animation
     * @param {float} dt - DeltaTime since last update, in 1/60th of a second. The dt variable, passed into your animation
     * @param {int} [maxTime=50] - The time to remain in one phase, divided by your speed. Increase this to slow down your base timer, or decrease it to speed up
     */
    static binaryTimer(source, speed, dt, maxTime = 50) {

        // The max amount of time to remain in one phase
        const calculatedMaxTime = maxTime / speed;

        if (source._flipped == undefined) {
            source._flipped = false;
        }

        // Keep track of currentTime using the source object
        if (!source._currentTime) {
            source._currentTime = 0;
        }
        source._currentTime += dt;

        // Run to frameCount, then do something
        if (source._currentTime >= calculatedMaxTime) {
            source._currentTime = 0;

            // Simple flag, do one of two things
            source._flipped = !source._flipped;
        }
    }

    /**
     * Creates and switches a _phase property on your light source after maxTime divided by speed. Useful for flashing animations.
     * Call at the start of your animation function.
     * 
     * Usage: After using this, check `this._phase` in your animation function, and run different code based on the result
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} speed - How quickly the phase will change. The speed variable, passed into your animation
     * @param {float} dt - DeltaTime since last update, in 1/60th of a second. The dt variable, passed into your animation
     * @param {int} [maxTime=50] - The time to remain in one phase, divided by your speed. Increase this to slow down your base timer, or decrease it to speed up
     */
    static ternaryTimer(source, speed, dt, maxTime = 50.0) {

        // The max amount of time to remain in one phase
        const calculatedMaxTime = maxTime / speed;

        if (source._phase == undefined) {
            source._phase = 0;
        }

        // Keep track of currentTime using the source object
        if (!source._currentTime) {
            source._currentTime = 0;
        }
        source._currentTime += dt;

        // Run to frameCount, then do something
        if (source._currentTime >= calculatedMaxTime) {
            source._currentTime = 0;

            // Three phase, do one of 3 things
            if(++source._phase > 3){
                source._phase = 0;
            }
        }
    }

    /**
     * Creates and flips a _flipped flag on your light source after a random time based on speed and offPhaseDelay. Useful for randomly blinking animations.
     * Call at the start of your animation function.
     * 
     * Usage: After using this, check `this._flipped` in your animation function, and run different code based on the result
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} speed - The speed variable, passed into your animation
     * @param {float} dt - DeltaTime since last update, in 1/60th of a second. The dt variable, passed into your animation
     * @param {int} offPhaseDelay - How long to wait before attempting random flip. Higher values increase the 'off' time
     * @param {Array<number>} [timeRangeFlipped=[1,1]] - Range of time that the phase can remain flipped 'on'. Both elements must be >= 1, and timeRangeFlipped[1] must be >= timeRangeFlipped[0]
     */
    static binaryFlashRandomInterval(source, speed, dt, offPhaseDelay = 10, timeRangeFlipped = [1, 1]) {

        // Ensure the array is valid
        if (timeRangeFlipped.length != 2 || timeRangeFlipped[0] < 1 || timeRangeFlipped[1] < 1 || timeRangeFlipped[0] > timeRangeFlipped[1]) {
            console.error('CommunityLighting error: binaryRandomInterval called with invalid timeRangeFlipped: ' + timeRangeFlipped);
            return;
        }

        // Ensure _flipped exists
        if (source._flipped == undefined) {
            source._flipped = false;
        }

        // Keep track of currentTime using the source object
        if (!source._currentTime) {
            source._currentTime = 0;
        }
        source._currentTime += dt;

        // Default phase
        if (!source._flipped) {
            // Wait until we pass offPhaseDelay before attempting to flip
            if (source._currentTime >= offPhaseDelay) {
                source._currentTime = 0;
                // Higher speed triggers more often
                if (Math.random() > (0.9 - (0.08 * speed))) {
                    source._flipped = true;
                    // Randomly select how long the flash remains 'on' from timeRangeFlipped
                    source._revertTime = Math.floor(Math.random() * (timeRangeFlipped[1] - timeRangeFlipped[0] + 1) + timeRangeFlipped[0]);
                }
            }
        } else if (source._currentTime >= source._revertTime) {
            // Flip back to default and restart
            source._currentTime = 0;
            source._flipped = false;
            source._revertTime = undefined;
        }
    }

    /**
     * Creates and switches a _phase property on your light source after a random time based on speed and offPhaseDelay. Useful for randomly blinking animations.
     * Call at the start of your animation function.
     * 
     * Usage: After using this, check `this._phase` in your animation function, and run different code based on the result
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} speed - The speed variable, passed into your animation
     * @param {float} dt - DeltaTime since last update, in 1/60th of a second. The dt variable, passed into your animation
     * @param {int} offPhaseDelay - How long to wait before attempting random flip. Higher values increase the 'off' time
     * @param {Array<number>} [timeRangeFlipped=[1,1]] - Range of time that the phase can remain flipped 'on'. Both elements must be >= 1, and timeRangeFlipped[1] must be >= timeRangeFlipped[0]
     */
    static ternaryFlashRandomInterval(source, speed, dt, offPhaseDelay = 10, timeRangeFlipped = [1, 1]) {
        
        // Ensure the array is valid
        if (timeRangeFlipped.length != 2 || timeRangeFlipped[0] < 1 || timeRangeFlipped[1] < 1 || timeRangeFlipped[0] > timeRangeFlipped[1]) {
            console.error('CommunityLighting error: ternaryRandomInterval called with invalid timeRangeFlipped: ' + timeRangeFlipped);
            return;
        }

        // Ensure _phase exists
        if (source._phase == undefined) {
            source._phase = 0;
        }

        // Keep track of currentTime using the source object
        if (!source._currentTime) {
            source._currentTime = 0;
        }
        source._currentTime += dt;

        // Default phase
        if (source._phase == 0) {
            // Wait until we pass offPhaseDelay before attempting to change phase
            if (source._currentTime >= offPhaseDelay) {
                source._currentTime = 0;
                // Higher speed triggers more often
                if (Math.random() > (0.9 - (0.08 * speed))) {
                    // Randomly select between phase 1 or 2
                    source._phase = Math.random()>0.5?1:2;
                    
                    // Randomly select how long the flash remains in phase 1/2 from timeRangeFlipped
                    source._revertTime = Math.floor(Math.random() * (timeRangeFlipped[1] - timeRangeFlipped[0] + 1) + timeRangeFlipped[0]);
                }
            }
        } else if (source._currentTime >= source._revertTime) {
            // Flip back to default and restart
            source._currentTime = 0;
            source._phase = 0;
            source._revertTime = undefined;
        }
    }

    /**
     * Generate a cosine wave, based on Foundry Core animations, and attach it to the source under the _wave property
     * _wave.simplifiedValue and _wave.invertedSimplifiedValue are floats between 0 and 1, and are useful for keeping things simple.
     * @param {PointSource} source 
     * @param {int} speed 
     * @param {int} intensity 
     * @param {float} dt 
     * @param {int} speedMultiplier 
     */
    static cosineWave(source, speed, intensity, dt, speedMultiplier = 1) {
        if(!source._wave){
            source._wave = {};
        }
        const distance = 0.1 * intensity;
        const ms = (30000 * speedMultiplier) / speed;
        const da = (2 * Math.PI) * ((60 * dt) / ms);
        source._wave.distance = distance;
        source._wave.a = source._wave.pulseAngle = (source._wave.pulseAngle ?? 0) + da;
        source._wave.delta = (Math.cos(source._wave.pulseAngle) + 1) / 2;
        
        source._wave.simplifiedValue = source._wave.delta * source._wave.distance;
        source._wave.invertedSimplifiedValue = 1 - source._wave.simplifiedValue;

        if (source._wave.a > (2 * Math.PI)) source._wave.pulseAngle = 0;
    }

    /**
     * @deprecated - Use GLSL blurring instead
     * Add a blur filter to the illumination shader
     * This will be removed once Advanced Lighting Toolkit releases and enables this functionality for all lights
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} strength - Blur Strength
     */
    static addIlluminationBlur(source, strength = 10, quality = 4) {
        if(source.illumination._blurred && source.illumination._blurred != strength){
            CLAnimationHelpers.removeIlluminationBlur(source);
        }
        if(!source.illumination._blurred && strength > 0){
            let blurFilter = new PIXI.filters.BlurFilter(strength, quality)
            blurFilter.blendMode = PIXI.BLEND_MODES.MAX_COLOR;
            if(source.illumination.filters){
                source.illumination.filters.push(blurFilter);
            } else {
                source.illumination.filters = [blurFilter];
            }
            source.illumination._blurred = strength;
        }
    }
    /**
     * Add a blur filter to the coloration shader
     * This will be removed once Advanced Lighting Toolkit releases and enables this functionality for all lights
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {int} strength - Blur Strength
     */
    static addColorationBlur(source, strength = 10, quality = 4) {
        if(source.coloration._blurred && source.coloration._blurred != strength){
            CLAnimationHelpers.removeColorationBlur(source);
        }
        if(!source.coloration._blurred){
            let blurFilter = new PIXI.filters.BlurFilter(strength, quality);
            blurFilter.blendMode = PIXI.BLEND_MODES.MAX_COLOR;
            if(source.coloration.filters){
                source.coloration.filters.push(blurFilter);
            } else {
                source.coloration.filters = [blurFilter];
            }
            source.coloration._blurred = strength;
        }
    }

    /**
     * Ensures the blur filter is removed from the illumination shader if set
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     */
    static removeIlluminationBlur(source) {
        if(source.illumination._blurred){
            source.illumination.filters = []; // TODO: Check specifically for a blur filter if possible, and remove it
            source.illumination._blurred = false;
        }
    }

    /**
     * Ensures the blur filter is removed from the coloration shader if set
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     */
    static removeColorationBlur(source) {
        if(source.coloration._blurred) {
            source.coloration.filters = []; // TODO: Check specifically for a blur filter if possible, and remove it
            source.coloration._blurred = false;
        }
    }

    /**
     * Ensures the blur filter is removed from coloration & illumination if set
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     */
    static removeBlur(source) {
        CLAnimationHelpers.removeIlluminationBlur(source);
        CLAnimationHelpers.removeColorationBlur(source);
    }

    /**
     * Forces the Coloration uniforms to work by updating the AmbientLight or Token source with a tintColor if it doesn't have one
     * 
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     */
    static async forceColorationShader(source, color = '#000001') {
        if (source._source) {
            var isToken = source._source.light ? true : false;
            if (isToken) {
                if (!source._source.data.lightColor || source._source.data.lightColor === '#000000') {
                    await source._source.update({
                        lightColor: color,
                        lightAnimation: source.animation
                    }, {
                        diff: false,
                        colorForce: true
                    });
                }
            } else {
                if (!source._source.data.tintColor || source._source.data.tintColor === '#000000') {
                    await source._source.update({
                        tintColor: color,
                        lightAnimation: source.animation
                    }, {
                        diff: false,
                        colorForce: true
                    });
                }
            }
        }
    }

    /**
     * Call another animation within your animation
     * @param {PointSource} source - The animations PointSource, 'this' from your animation function
     * @param {String} animationName - The function name of the animation to include
     * @param {float} dt - The dt variable, passed into your animation
     * @param {Object} parameters - An object filled with parameters to pass to the animation. Should at least contain speed and intensity, along with any other custom properties the animation supports (if any)
     * @param {int} intensity - The intensity variable, passed into your animation
     */
    static includeAnimation(source, animationName, dt, parameters) {
        try{
            CommunityLighting.animationManager.communityAnimations[animationName].call(source, dt, parameters);
        } catch(e){
            console.log(`Attempt to include animation ${animationName} failed`);
        }
    }
}