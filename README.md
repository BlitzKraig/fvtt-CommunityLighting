# Community Lighting for FVTT

![CommunityLighting Release](https://github.com/BlitzKraig/fvtt-CommunityLighting/workflows/CommunityLighting%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-CommunityLighting/latest/communitylighting-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

## Community Lighting for 0.7.3+

This module aims to provide a platform for FVTT users to create and publish their own lighting animations, and provide a good selection of community made lighting animations to GameMasters.

PRs are open for new lighting animations! See Contribution Tutorial below.

## Contributing

PRs are welcome to add your own lights.

Please note that _removing_ or significantly altering already added lights will require a good reason, added in the PR description - I want to avoid breaking users scenes where possible.

## Contribution Tutorial

### 1. JSON

Add your Author object inside `lights.json`

```JSON
"ExampleUser": {

}

```

This is where you lights definitions will live, alongside optional details.

You can add your Discord tag if you want users to be able to contact you via discord when they're having issues with your particular animation, or links to your Github, Twitter and Youtube, which will appear in the attributions page. These are all completely optional.

``` JSON
"ExampleUser": {
        "discord": "ExampleUser#00000",
        "links": {
            "github": "https://githubhere",
            "twitter": "https://twitterhere",
            "youtube": "https://youtubehere"
        }
}
```

Next, you can define your lights. These definitions will be stored inside a `lights` array, and must at least contain a `name` and a `shaderName`.

The `name` will be displayed in the animation selection dropdown for an ambient light. Try to keep these unique if possible.

The `shaderName` must match your animation function name, which we'll set up down below.

You can optionally add a `description`, `intensityDescription` and `speedDescription`, which will be displayed later, describing your light, what the intensity slider does, and what the speed slider does.

Finally, you can add a `translationName`, which will allow all of these details to be translated using Foundrys translation features, which we'll cover later.

``` JSON
"ExampleUser": {
        "discord": "ExampleUser#00000",
        "links": {
            "github": "https://githubhere",
            "twitter": "https://twitterhere",
            "youtube": "https://youtubehere"
        },
         "lights": [
            {
                "translationName": "coolLight",
                "name": "My Cool Light",
                "shaderName": "coolLight",
                "description": "A basic, but very cool light",
                "intensityDescription": "Controls how radical the light will be!",
                "speedDescription": "Controls how often the light will be radical."
            },
            {
                "name": "My Less Cool Light",
                "shaderName": "boringLight"
            }
         ]
}
```

Your JSON is complete. Make sure you have your commas in the right places, and you've not mangled any other author objects in the process.

### 2. Javascript

Once you've defined your lights in the JSON, we'll move on to actually building them.

Open the `modules/animations.js` file.

Scroll down to the bottom and create your animation function, using the name you defined in `shaderName` in the JSON file.

Note, try to keep all of your own lights together in the file. I'd suggest prefixing the `shaderName` and function with your author name until I implement some better organization.

Your animation function needs to accept 2 (3) arguments:
* dt - DeltaTime
* {speed, intensity} - The values from the speed & intensity sliders

You can use the animation functions already in the file as a starting point.

``` javascript
coolLight(dt, {
    speed = 5,
    intensity = 5
}) {
// Your code here
}
```

Inside this function, the `this` keyword will refer to the lightsource being animated.

`this.illumination` and `this.coloration` refer to the shaders that handle the light circle, and the color.

Most of your modifications will probably be to their `uniforms`.

For example:
`this.illumination.uniforms.alpha = 0.5` will set the illumination to half brightness.

Keep in mind that to 'animate' a light, you will need to alter these values based on something else. You can check `blitzPulseTest` inside `animations.js` to see how the pulse animation works, based on Pulse in Foundry Core.

You can also use the static methods in `CLAnimationHelpers` to help simplify some of the process. See `blitzSimpleFlash` for a fairly easy example.

Note that if you've come up with something useful that can be easily re-used, you can add it into `animationhelpers.js`, and it will appear in the `CLAnimationHelpers` class for other authors to use.

When you're ready to test, save the file. Refresh Foundry, and double click on an Ambient Light. Find your animation in the `Light Animation Type` dropdown, and select it. Save the light and see how your animation looks!

### 3. Translation

If you want to support translating your light names, descriptions etc., you need to make sure you have a `translationName` setup in the light object inside `lights.json`

``` JSON
"ExampleUser": {
        ...
         "lights": [
            {
                "translationName": "coolLight",
                ...
            }
         ]
```

Once you've done this, open up `lang/en.json`, or another language file in that dir.

In this file, add your Authors object, with the same spelling and capitalisation as in `lights.json`

``` JSON
{
    "COMMUNITYLIGHTING": {
        "authors": {
            ...,
            "ExampleUser": {

            }
        }

    }
}

```

Inside your Author object, add a new object for each translation-supported light, using the `translationName` as the obect name

``` JSON
{
    "COMMUNITYLIGHTING": {
        "authors": {
            ...,
            "ExampleUser": {
                "coolLight": {

                }
            }
        }

    }
}
```

Inside each translateable light, add the properties you wish to translate.

Supported properties are `name`, `description`, `intensityDescription` and `speedDescription`.

Note that if you add translations here, you don't need to add those properties in `lights.json`

``` JSON
{
    "COMMUNITYLIGHTING": {
        "authors": {
            ...,
            "ExampleUser": {
                "coolLight": {
                        "name": "My Cool Light",
                        "description": "A basic, but very cool light",
                        "intensityDescription": "Controls how radical the light will be!",
                        "speedDescription": "Controls how often the light will be radical."
                }
            }
        }

    }
}
```

And that's it, the module will handle the rest for you.

If you're a polyglot, consider adding more translations for different languages!

### 4. Integrating into the module

Create a Pull Request, targetting the `integration` branch.

I'll review your changes as soon as I can, and put your work into the next release.

Initially, I'll try to keep up with attributions in the github.

Eventually, I'm planning a more advanced system inside foundry that will automatically update using the data you added into `lights.json`, crediting authors and optionally allowing users to get in touch if they're having issues.

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-CommunityLighting/master/module.json`

## Feedback

This module is open for feedback and suggestions! I would love to improve it and implement new features.

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

Additionally, light authors can provide their contact details, if they so choose. These details can be found by hovering over the animation name in the light config.

## [Release Notes](./CHANGELOG.md)

