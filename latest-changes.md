# CommunityLighting Release - 2021/06/16

## Audioreactive lighting re-write

### Performance

The previous system ran calculations on every light. The new system instead runs an analyser for each band, and the lights simply grab the cached values instead.

### Volume independence

Now volume-independent, so differing audio levels will all work instantly.
This means if you have a player with muted playlist audio, and another player with full-volume playlist audio, they will both still see the reactive lighting.

### Improved detection

The band detection algorithm has been re-written, providing far smoother and more pleasing results

## New lights

### Polylight

A simple polygonal light. Set the number of sides to have a square, triangle, hex etc. light.
Includes some basic blurring and torch-like flickering

### Custom Fire

A new fire shader with experimental options.
Includes animated-enable, optional audio-reactivity, and lots of options.
Very useful for a large fire, or for re-usable torches with a 'real' flame.
Set the bright radius to control the size of the flame. Enable 'Cast Light' to add light circles.