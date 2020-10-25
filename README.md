# Community Lighting for FVTT

![CommunityLighting Release](https://github.com/BlitzKraig/fvtt-CommunityLighting/workflows/CommunityLighting%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-CommunityLighting/latest/communitylighting-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

## Community Lighting for 0.7.5+

This module aims to provide a platform for FVTT users to create and publish their own lighting animations, and provide a good selection of community made lighting animations to GameMasters.

### Demo scene ft. custom shaders provided by SecretFire

![Lighting Demo](docs\demo.gif)

### For GameMasters

Download this module and enjoy the new Lighting Animations provided!

### For Content Creators

Read through the Contribution Tutorial below and add your lighting animations!

## Contributing

Tutorial below. PRs are always open to add your own lighting animations.

If you wish to _remove_ or significantly alter the logic for one or more of your already added lights, please provide a reason added in your PR description - I want to avoid breaking users scenes where possible.

## Contribution Tutorial

To create and publish your own custom lighting animation, you'll need to run through a couple of steps:

1. Register your animation metadata in `lights.json`
2. Build your actual animation in `modules/animations.js`

And optionally

3. Provide translations in the `lang` files

Once this is done, you can create a Pull Request and integrate your work into the module, covered in

4. Integrating into the module

We will run through each of these steps below. I will also provide an example implementation at the end.

If you have any issues following this tutorial, feel free to ping me on Discord at Blitz#6797

### 0. Getting set up

If you already know how develop and edit modules, skip to the next section.

> Prerequisites: Foundry 0.7.5+, Git

To get started, first you'll need to clone this repo into your `modules` directory.

In a terminal, navigate to the `modules` directory and run:
`$ git clone https://github.com/BlitzKraig/fvtt-CommunityLighting.git`

Once the repo is cloned, ensure the directory name matches the name provided in `module.json` - `CommunityLighting`

Launch Foundry

Launch a world

Open `Manage Modules`, and enable `CommunityLighting by Blitz`

You are now ready to begin creating your lighting animations.
Open the module directory in the editor of your choice, and follow the rest of the tutorial.

### 1. JSON

You must first register your lights metadata in a specific JSON file, so CommunityLighting knows how to set up your animations.

First, add your Author object inside `lights.json`. You can use any name you want, but please keep all of your metadata inside the one Author object.

```JSON
"ExampleUser": {

}

```

This is where you lights definitions will live, alongside optional details.

You can add your Discord tag if you want users to be able to contact you via discord when they're having issues with your particular animation, or links to your Github, Twitter and Youtube, which will appear in the attributions page (Not yet built). *These are all completely optional.*

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

Next, you can define your lights. These definitions will be stored inside a `lights` array, and **must** at least contain a `name` and a `animationFunction`.

The `name` will be displayed in the animation selection dropdown for an ambient light. Try to keep these unique if possible.

The `animationFunction` must match your animation function name, which we'll set up down below. It should consist of alphabetical characters only, preferably in `camelCase`.

You can optionally add a `description`, `intensityDescription` and `speedDescription`, which will be displayed in a later update, describing your light, what the intensity slider does, and what the speed slider does. These sliders are provided by Foundry core, and can be seen in the configuration panel for a light.

Finally, you can add an optional `translationName`, which will allow all of these details to be translated using Foundrys translation features, which we'll cover later. The `translationName` should consist of alphabetical characters only, preferably in `camelCase`.

``` JSON
{
    "Blitz": {
        ...
    },
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
                    "animationFunction": "coolLight",
                    "description": "A basic, but very cool light",
                    "intensityDescription": "Controls how radical the light will be!",
                    "speedDescription": "Controls how often the light will be radical."
                },
                {
                    "name": "My Less Cool Light",
                    "animationFunction": "boringLight"
                }
             ]
    }
}
```

> Note that the first `light` object, "My Cool Light" contains all of the optional properties, while the second object "My Less Cool Light" contains the bare minimum to get started.
> I recommend providing as much detail as possible.

Your JSON is complete! Make sure you have your commas in the right places, and you've not mangled any other author objects in the process.

#### A note on Custom Shaders

Custom Shaders are supported, but not yet fully documented.

In order to use a custom shader, please see the `Custom Shader Example` light under `Blitz` in lights.json.

Add any shader code to `modules/shaders.js`

SecretFire has provided some exclusive shaders for CommunityLighting, and added some comments in `shaders.js`, which should help you get started if you want to dive into shader creation!

### 2. Javascript

Once you've defined your lights in the JSON, we'll move on to actually building them.

Open the `modules/animations.js` file.

Scroll down to the bottom of the file and create your animation function, using the name you defined in `animationFunction` in the JSON file.

> Try to keep all of your own lights together in the file. I'd suggest prefixing the `animationFunction` and function with your author name until I implement some better organization.

Your animation function needs to accept 2 arguments, an integer and an Object, which are passed in from Foundry core:

* `dt` - DeltaTime - Time since last 'frame', in 1/60th of a second
* `{speed, intensity}` - The values from the speed & intensity sliders - Both `1` to `10`

> You can copy & paste one of the animation functions already in the file as a starting point.

``` javascript
coolLight(dt, {
    speed = 5,
    intensity = 5
}) {
// Your code here
}
```

> **IMPORTANT** The function name (`coolLight`) matches the `animationFunction` (`coolLight`) provided in the JSON in step 1

The `= 5` on the `speed` and `intensity` declarations simply tell the function to default these variables to `5` if they are not provided by the caller.

Inside this function, the `this` keyword will refer to the lightsource being animated.

`this.illumination` and `this.coloration` refer to the shaders that handle the light circle, and the color.

Most of your modifications will probably be to their `uniforms` objects, which contain multiple properties you can play with.

For example:
`this.illumination.uniforms.alpha = 0.5` will set the illumination to half brightness.

Some useful uniforms:

* illumination
  * `alpha` - The illuminations opacity - `0.0` to `1.0`
  * `ratio` - The ratio of bright to dim light - `0.0` to `1.0`
* coloration
  * `alpha` - The colors opacity - `0.0` to `1.0`
  * `ratio` - The ratio of bright to dim color - `0.0` to `1.0`
  * `color` - The displayed color - RGB Array `[0,0,0]` to `[1,1,1]`
  * `sharpness` - Currently unsupported - Foundry core removed this, but is expected to add it again soon.

> You can change a lot more than just the shader uniforms, but you'll have to experiment to see exactly what you can do.

Keep in mind that to 'animate' a light, you will need to alter these values based on something else (usually time, often using a wave function). You can check `blitzPulseTest` inside `animations.js` to see how the pulse animation works, based on Pulse in Foundry Core.

You can also use the static methods in `CLAnimationHelpers` to help simplify some of the process. See `blitzSimpleFlash` for a fairly easy example, using the `binaryTimer` helper to flip a light between two states at regular intervals.

>If you've come up with something useful that can be easily re-used by other animations, feel free to add it into `animationhelpers.js`, and it will appear in the `CLAnimationHelpers` class for other authors to use if approved.

Additionally, if you need to keep track of any specific value, it is recommended to add a property to `this`, prefixed with an underscore, eg. `this._myCustomVar = 0`
This will allow you to check or update `this._myCustomVar` every 'frame'

Your animation code might look something like this:

``` javascript
coolLight(dt, {
    speed = 5,
    intensity = 5
}) {
    /* Example code for a simple flashing light */
    /* `speed` controls how quickly the light will flip on and off */
    /* `intensity` controls how dim the light will be when it is 'off' */

    CLAnimationHelpers.binaryTimer(this, speed); // Use the binaryTimer helper to set `this._flipped` to true/false, based on speed

        if (this._flipped) {
            // Set the alpha somewhere between 0 and 0.9, depending on intensity
            let alpha = 1 - (0.1 * intensity);
            this.illumination.uniforms.alpha = alpha; // Update the shader displaying the light emission
            this.coloration.uniforms.alpha = alpha; // Update the shader displaying the color of the light
        } else {
            // Set the alpha back to full
            this.illumination.uniforms.alpha = 1;
            this.coloration.uniforms.alpha = 1;
        }
    }
}
```

> The example code above is provided for simplicity, and is not very performant. It also does not respect the Opacity value set on the light, as this directly alters the coloration alpha. There is a more advanced version of this in `modules/animations.js`, `blitzSimpleFlash`

When you're ready to test, save the file.
Refresh Foundry, and double click on an Ambient Light, or create a new one.
Find your animation in the `Light Animation Type` dropdown, and select it.
Save the light and see how your animation looks!

### 3. Translation

If you want to support translating your light names, descriptions etc., you need to make sure you have a `translationName` setup in the light object inside `lights.json`, as described in step 1

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

Currently supported properties are `name`, `description`, `intensityDescription` and `speedDescription`.

> If you add translations here, you don't need to add those same properties in your light object in `lights.json`, but having both shouldn't cause any problems.

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

## In the works

* Ability to hide/show animations from the selection UI
* Optional selection UI overhaul - Searchable, categorized
* Full custom shader support
* More animation helpers
* Improved onboarding and documentation
* Support for Advanced Lighting Toolkit (Upcoming module)

## Feedback

This module is open for feedback and suggestions! I would love to improve it and implement new features.

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

Additionally, light authors can provide their Discord/GitHub contact details, if they so choose. These details can be found by hovering over the animation name in the light config (Not yet implemented).

## [Release Notes](./CHANGELOG.md)
