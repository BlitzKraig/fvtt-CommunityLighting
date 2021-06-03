# 0.3.5 - 2021/06/03

* Updated for 0.8.6 - Update provided by SecretFire

# 0.3.1 - 2020/11/06

* Fixed json loading on servers using ROUTE_PREFIX

# 0.3.0 - 2020/10/28

* Added custom properties support
* Added optgroup organization by author
* General lighting updates
    * Added ratiodamper to torches to help mitigate huge ratio changes on large lights
    * Added new experimental functionality to lightning style lights, hiding them completely when 'off'
    * 
* New lights
* New shader from SecretFire
* All lights now have their placeable cached
* Fixed multiple token lighting issues
* Added audioreactive light support
* Added cross-module support for SoundBoard by Blitz

Full commitlog

* Added optgroup replacer for animtype select el
* Added intellisense refs for chroma and pixi-filter
* Added forced red color to blitz flash lights
* Added custom property manager class
* Added new colorshift light to demo customvars
* Removed pulseTest
* Moved cachePlaceable to preanim, added to all lights
* Implemented customVar persistence
* Tweaked forceFieldExtension to only run chroma if both colors are present
* Switched terminology from customVars to customProperties
* Re-organized customprop light in lights.json
* Updated forceColorationShader to work for tokens
* Added workaround for tokens with new light saving and loading customprops
* Fixed checkbox and select chosen values
* Added semi-useful reason to have all customprop types on ffextensionlight
* Removed None from select customprop
* Fixed bug: checkboxes now instantiate with correct value
* Updated includeAnimation to take in an obj of params
* Added ratiodamper to alternatetorch and blurtorch
* Added TODO to gitignore
* Added audioreactor experiment
* Improved audioreactor experiment. Added soundboard support and new options
* Fixed hang on reload if soundboard analyser is not ready
* Updated blur helper to allow for strength changes
* Added new blurred lights, updated torch with secondaryColor
* Changed Music to Audio in reactive names. Added audio fade only light
* Updated contribution tutorial, updated module version
* Add starlight shader and 2 animations
* Updating Star Light with sound improvements
* Updated lighting with experimental functionality to completely hide source when not flashing

# 0.2.0 - 2020/10/25

* Exclusive custom shaders from SecretFire!
    * 2 new lighting shaders: Grid Force-Field & Smoke Patch
    * Shader documentation from SecretFire - Eternal thanks for this!
* Fixed forceColorationShader to prevent multiple updates
* Added optional color to forceColorationShader helper
* Updated readme, added demonstration gif
* Added pt-BR translation from rinnocenti

# 0.1.1 - 2020/10/24

* Fixed token light animations breaking when trying to grab original color alpha

# 0.1.0 - 2020/10/23

* Initial Release!
