class CLPreAnimation {

    /**
     * Finds and caches the AmbientLight placeable as _source, and sets _placeableType to "AmbientLight" or "Token"
     * 
     * @param {PointSource} pointSource - The animations PointSource, 'this' from your animation function
     */
    static cachePlaceable(pointSource) {
        if (!pointSource._source) {
            pointSource._source = canvas.lighting.placeables.find(t => t.source == pointSource);
            if (pointSource._source) {
                pointSource._placeableType = "AmbientLight";
            } else {
                pointSource._source = canvas.tokens.placeables.find(t => t.light == pointSource);
                if (pointSource._source) {
                    pointSource._placeableType = "Token";
                }
            }
        }
    }

    static onPointSourceInit(pointSource, animationName) {
        // Before all animations
        CLAnimationHelpers.removeBlur(pointSource); // Ensure blur is removed. Animations using blur will re-add it if they need it
        CLPreAnimation.cachePlaceable(pointSource); // Find and cache AmbientLight or Token placeable as _source

        if (animationName) { // Only bother loading vars if we have an animation on this pointSource
            CLCustomPropertyManager.loadCustomProperties(pointSource);
        }

        // Clear some common custom properties
        pointSource._flipped = undefined;
        pointSource._originalColorAlpha = undefined;
        pointSource._originalColor = undefined;

        // Before specific animation. Maybe useful in some very specific cases
        // switch (animationName) {
        //     case "myAnimation":
        //         break;
        //     default:
        //         break;
        // }
    }
}