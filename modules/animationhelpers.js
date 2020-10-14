class CLAnimationHelpers {

    /**
     * Creates and flips a _flipped flag on your light source after maxTime divided by speed. Useful for flashing animations
     * Call at the start of your animation function.
     * 
     * Usage: After using this, check `this._flipped` in your animation function, and run different code based on the result
     * @param {Object} source - The lighting container, 'this' from your animation function
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
     * @param {Object} source - The lighting container, 'this' from your animation function
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
     * @param {Object} source - The lighting container, 'this' from your animation function
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
     * @param {Object} source - The lighting container, 'this' from your animation function
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
}