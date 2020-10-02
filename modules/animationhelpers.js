class CLAnimationHelpers {

    /**
     * Call at the start of your animation function.
     * Creates and flips a _flipped flag on your light source after maxFrames divided by speed. Useful for flashing animations
     * 
     * Usage: After using this, check `this._flipped` in your animation function, and run different code based on the result
     * @param {Object} source - The lighting container, 'this' from your animation function
     * @param {int} speed - The speed variable, passed into your animation
     * @param {int} [maxFrames=50] - The max frame count, divided by your speed. Increase this to slow down your base timer, or decrease it to speed up
     */
    static binaryTimer(source, speed, maxFrames = 50) {
        const frames = maxFrames / speed;

        // Keep track of currentFrame using the source object
        if (!source._currentFrame) {
            source._currentFrame = 0;
        }
        source._currentFrame++;

        // Run to framecount, then do something
        if (source._currentFrame >= frames) {
            source._currentFrame = 0;

            // Simple flag, do one of two things
            source._flipped = !source._flipped;
        }
    }
}