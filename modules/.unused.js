// Ignore me! I am all experimental and spooky. I don't work, but some of me does, so I'm being kept around for later.

// static createFilter() {
//     // Create illumination container components
//     // const c = new PIXI.Container();
//     // c.background = c.addChild(new PIXI.Graphics());
//     // c.lights = c.addChild(new PIXI.Container());
//     // c.lights.sortableChildren = true;

//     // // Apply a multiply blend filter to the entire layer
//     // const blur = this._blurDistance;
//     // c.filter = blur ? new PIXI.filters.BlurFilter(blur) : new PIXI.filters.AlphaFilter(1.0);
//     // c.filter.blendMode = PIXI.BLEND_MODES.MULTIPLY;
//     // c.filters = [c.filter];
//     // c.filterArea = canvas.app.renderer.screen;
//     // return c;


//     const c = new PIXI.Container();
//     const blur = this._blurDistance;
//     c.filter = blur ? new PIXI.filters.BlurFilter(blur) : new PIXI.filters.AlphaFilter(1.0);
//     c.filter.blendMode = PIXI.BLEND_MODES.ADD;
//     c.filters = [c.filter];
//     return c;
// }
// // ExampleUser
// exampleLight(dt, {
//     speed = 5,
//     intensity = 5
// }) {
//     // Note that this is based on the Pulse light from Foundry Core
//     if (!this._usingCustomFilter) {
//         //     // this.coloration = CLAnimations.createFilter();
//         this.coloration.filter = new PIXI.filters.SimpleLightmapFilter();
//         this.coloration.filter.autoFit = false;
//         let colorationCoods = canvas.app.stage.toGlobal(this)
//         this.coloration.filterArea = new PIXI.Rectangle(colorationCoods.x, colorationCoods.y, this.radius, this.radius);
//         // this.illumination.filter = new PIXI.filters.DotFilter();
//         this.coloration.filters = [this.coloration.filter];


//         // this.illumination.filter = new PIXI.filters.SimpleLightmapFilter();
//         // this.illumination.filter.autoFit = false;
//         // let illuminationCoods = canvas.app.stage.toGlobal(this)
//         // this.illumination.filterArea = new PIXI.Rectangle(illuminationCoods.x, illuminationCoods.y, this.radius, this.radius);
//         // // this.illumination.filter = new PIXI.filters.DotFilter();
//         // this.illumination.filters = [this.illumination.filter];
//         // this.coloration.filterArea = canvas.app.renderer.screen;

//         // this.illumination.filter = new PIXI.filters.SimpleLightmapFilter();
//         // this.illumination.filter.autoFit = false;
//         // this.illumination.filters = [this.illumination.filter];
//         // this.illumination.filterArea = canvas.app.renderer.screen;


//         // this.illumination.filters = [this.illumination.filter];
//         //     this.coloration.filter.blendMode = PIXI.BLEND_MODES.ADD;
//         //     this.coloration.filters = [this.coloration.filter];
//         //     this.coloration.filterArea = canvas.app.renderer.screen;
//         //     this.illumination.filter = new PIXI.filters.AlphaFilter(1.0);
//         //     this.illumination.filter.blendMode = PIXI.BLEND_MODES.MULTIPLY;
//         //     this.illumination.filters = [this.illumination.filter];
//         //     this.illumination.filterArea = canvas.app.renderer.screen;

//         this.coloration.filter.uniforms.uLightmap = PIXI.Texture.from("modules/CommunityLighting/gobos/stretched_window.png")
//         // this.illumination.filter.uniforms.uLightmap = PIXI.Texture.from("modules/CommunityLighting/gobos/stretched_window.png")

//         this._usingCustomFilter = true;
//         // this.coloration.filter.uniforms.uLightmap.baseTexture.source.loop = true;
//         // this.coloration.filter.uniforms.uLightmap.baseTexture.source.autoplay = true;
//         // this.coloration.filter.uniforms.uLightmap.baseTexture.source.play();

//         // this.illumination.filter.uniforms.uLightmap.baseTexture.source.loop = true;
//         // this.illumination.filter.uniforms.uLightmap.baseTexture.source.autoplay = true;
//         // this.illumination.filter.uniforms.uLightmap.baseTexture.source.play();
//     }

//     if (this.coloration.filter.uniforms.uLightmap.baseTexture.source.paused) {
//         this.coloration.filter.uniforms.uLightmap.baseTexture.source.play();
//     }
//     // if (this.illumination.filter.uniforms.uLightmap.baseTexture.source.paused) {
//     //     this.illumination.filter.uniforms.uLightmap.baseTexture.source.play();
//     // }

//     let colorationCoods = canvas.app.stage.toGlobal(this)

//     this.coloration.filterArea.x = colorationCoods.x - ((this.radius) * canvas.app.stage.scale.x);
//     this.coloration.filterArea.y = colorationCoods.y - ((this.radius) * canvas.app.stage.scale.y);
//     this.coloration.filterArea.width = (this.radius * 2) * canvas.app.stage.scale.x;
//     this.coloration.filterArea.height = (this.radius * 2) * canvas.app.stage.scale.y;

//     // this.illumination.filterArea.x = colorationCoods.x - ((this.radius) * canvas.app.stage.scale.x);
//     // this.illumination.filterArea.y = colorationCoods.y - ((this.radius) * canvas.app.stage.scale.y);
//     // this.illumination.filterArea.width = (this.radius * 2) * canvas.app.stage.scale.x;
//     // this.illumination.filterArea.height = (this.radius * 2) * canvas.app.stage.scale.y;

//     // this.coloration.filterArea = new PIXI.Rectangle(this.x,this.y, 100, 100)
//     // Cosine wave
//     const di = Math.min(intensity / 10, 0.9);
//     const ms = 30000 / speed;
//     const da = (2 * Math.PI) * ((60 * dt) / ms);
//     const a = this._pulseAngle = (this._pulseAngle ?? 0) + da;
//     const delta = (Math.cos(a) + 1) / 2;


//     // Evolve illumination
//     const iu = this.illumination.uniforms;
//     const r = this.bright / this.dim;
//     const min = (1 - di) * r;


//     // The ratio of bright to dim light
//     iu.ratio = (delta * min) + ((1 - delta) * r);
//     iu.alpha = (delta * min) + (1 - delta);

//     // The alpha value of the whole illumination container
//     // iu.alpha = ((delta * 0.75) * min) + (1 - delta);

//     // Evolve coloration
//     const cu = this.coloration.uniforms;
//     const cMin = 0;

//     // The alpha value of the whole coloration container
//     cu.alpha = (delta * cMin) + ((1 - delta) * this.alpha);
//     // this.coloration.filter.uniforms.scale = ((delta * cMin) + ((1 - delta) * this.alpha)) / 2;
//     // this.coloration.filter.uniforms.angle = ((delta * cMin) + ((1 - delta) * this.alpha));
//     // // The alpha value of the whole coloration container
//     cu.ratio = (delta * min) + ((1 - delta) * r);
//     // cf.uniforms.alpha = Math.random();
//     // cf.uniforms.ratio = Math.random();
//     // cf.uniforms.sharpness = Math.random();
//     cu.color = [cu.ratio + 0.5, cu.ratio + 0.5, cu.ratio + 0.5]
//     // // The alpha value of the whole coloration container
//     // cf.uniforms.color = (delta * cMin) + ((1 - delta) * this.alpha);
//     // // The alpha value of the whole coloration container
//     // cf.uniforms.sharpness = (delta * min) + (1 - delta);

//     // Switch direction
//     if (a > (2 * Math.PI)) this._pulseAngle = 0;

// }