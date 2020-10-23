class CLPreAnimation {
    static onPointSourceInit(pointSource, animationName) {
        // Before all animations
        CLAnimationHelpers.removeBlur(pointSource); // Ensure blur is removed. Animations using blur will re-add it if they need it

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