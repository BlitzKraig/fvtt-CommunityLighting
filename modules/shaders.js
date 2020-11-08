class CLShaderFunctions {
    static rotate = `
    vec2 rotateUV(in vec2 uv, in float rotation, in vec2 mid)
    {
        return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
        );
    }`;
    static scale = `
    vec2 scaleUV(in vec2 uv, in float scale)
    {
        uv -= 0.5;
        uv *= 1.0 / scale;
        uv += 0.5;
        return uv;
    }`;
    static stretch = `
    vec2 stretchUV(in vec2 uv, in vec2 stretch)
    {
        uv -= 0.5;
        uv.x *= 1.0 / stretch.x;
        uv.y *= 1.0 / stretch.y;
        uv += 0.5;
        return uv;
    }`;
    static translate = `
    vec2 translateUV(in vec2 uv, in vec2 translate)
    {
        uv += translate - 1.0;
        return uv;
    }`
    static blur = `
    vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture2D(image, uv) * 0.2270270270;
        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
      }`;
    static getPix = `vec4 pix = texture2D(sampler, stretchUV(rotateUV(scaleUV(translateUV(vUvs, vec2(translateX, translateY)), scale), radians(rotation), vec2(0.5)), vec2(stretchX, stretchY)));`;
    static gobo = {
        uniforms: `
        uniform sampler2D sampler;
        uniform bool useSampler;
        uniform bool invert;
        uniform float goboType;
        uniform float rotation;
        uniform float scale;
        uniform float stretchX;
        uniform float stretchY;
        uniform float translateX;
        uniform float translateY;
        uniform float smoothness;
        `,
        functions: `
        ${CLShaderFunctions.rotate}
        ${CLShaderFunctions.scale}
        ${CLShaderFunctions.stretch}
        ${CLShaderFunctions.translate}
        `,
        gsColAvg: `
        ${CLShaderFunctions.getPix}
        float avg = (pix.r + pix.g + pix.b) / 3.0;
        if(invert) {
            avg = 1.0 - avg;
        }
        gsCol = vec3(avg);
        `,
        gsColSilhouette: `
        ${CLShaderFunctions.getPix}
        float avg = (pix.r + pix.g + pix.b) / 3.0;
        if(avg > 0.0){
            avg = 1.0;
        }
        if(invert) {
            avg = 1.0 - avg;
        }
        gsCol = vec3(avg);
        `,
        gsColReal: `
        ${CLShaderFunctions.getPix}
        if(invert){
            gsCol = vec3(1.0 - pix.r, 1.0 - pix.g, 1.0 - pix.b);
        } else {
            gsCol = vec3(pix.r, pix.g, pix.b);
        }
        `,
        gsColBlur: `
        vec4 pix = blur(sampler, stretchUV(rotateUV(scaleUV(vUvs, scale), radians(rotation), vec2(0.5)), vec2(stretchX, stretchY)), vec2(100.0,100.0), vec2(smoothness/500.0,-smoothness/500.0));
        //pix = blur(pix, vUvs, vec2(100.0,100.0, vec2(smoothness,-smoothness)))
        float avg = (pix.r + pix.g + pix.b) / 3.0;
        if(invert) {
            avg = 1.0 - avg;
        }
        gsCol = vec3(avg);
        `
    }
}


  
  /**
   * The default coloration shader used by standard rendering and animations
   * A fragment shader which creates a solid light source.
   * @implements {AbstractBaseShader}
   */
  class CLStandardIlluminationShader extends AbstractBaseShader {
      
    static supports = {
        gobo: true,
        blur: true
    }
    static fragmentShader = `
    precision mediump float;
    uniform float alpha;
    uniform float ratio;
    uniform vec3 colorDim;
    uniform vec3 colorBright;
    varying vec2 vUvs;
    ${CLShaderFunctions.gobo.uniforms}
    
    ${CLShaderFunctions.gobo.functions}

    void main() {
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        vec3 color = mix(colorDim, colorBright, smoothstep(dist - (smoothness / 500.0), dist + (smoothness / 500.0), ratio));
        if(useSampler){
            vec3 gsCol;
            if(goboType == 1.0){
              ${CLShaderFunctions.gobo.gsColReal}
            } else if(goboType == 2.0) {
              ${CLShaderFunctions.gobo.gsColSilhouette}
            } else {
              ${CLShaderFunctions.gobo.gsColAvg}
            }
          gl_FragColor = vec4(clamp(gsCol * color, 0.0, 1.0) * alpha, 1.0);
        } else {
          gl_FragColor = vec4((color * alpha), 1.0);
        }
    }`;
    static defaultUniforms = {
      alpha: 1,
      ratio: 0.5,
      colorDim: [0.5, 0.5, 0.5],
      colorBright: [1.0, 1.0, 1.0],
      time: 0,
      intensity: 5,
      // Global custom properties
      smoothness: 0,
      sampler: '',
      rotation: 0,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
      translateX: 1,
      translateY: 1,
      useSampler: false,
      goboType: 0.0
    }
  }
  
  /* -------------------------------------------- */
  
  /**
   * The default coloration shader used by standard rendering and animations.
   * A fragment shader which creates a light source.
   * @implements {AbstractBaseShader}
   */
  class CLStandardColorationShader extends AbstractBaseShader {
    static supports = {
        gobo: true,
        blur: true
    }
    static fragmentShader = `
    precision mediump float;
    uniform bool darkness;
    uniform float alpha;
    uniform vec3 color;
    varying vec2 vUvs;
    ${CLShaderFunctions.gobo.uniforms}
    
    ${CLShaderFunctions.gobo.functions}
    ${CLShaderFunctions.blur}

    ${AbstractBaseShader.FADE(3, 1)}
      
    void main() {
      
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        vec3 fcolor = (darkness ? vec3(0.0) : color * fade(dist) * alpha);
        if(useSampler){
            vec3 gsCol;
            if(goboType == 1.0){
              ${CLShaderFunctions.gobo.gsColReal}
            } else if(goboType == 2.0) {
              ${CLShaderFunctions.gobo.gsColSilhouette}
            } else {
              ${CLShaderFunctions.gobo.gsColAvg}
            }
          gl_FragColor = vec4(clamp(gsCol * fcolor, 0.0, 1.0), 1.0);
        } else {
          gl_FragColor = vec4(fcolor, 1.0);
        }
    }`;
    static defaultUniforms = {
      alpha: 1.0,
      color: [1.0, 1.0, 1.0],
      time: 0,
      intensity: 5,
      darkness: false,
      // Global custom properties
      smoothness: 0,
      sampler: '',
      rotation: 0,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
      translateX: 1,
      translateY: 1,
      useSampler: false,
      goboType: 0.0
    }
  }


// === CUSTOM SHADERS ===

/**
 * Wave animation illumination shader
 * @implements {StandardIlluminationShader}
 * @author SecretFire
 */
class CLCustomWaveIlluminationShader extends StandardIlluminationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform float ratio;
    uniform vec3 colorDim;
    uniform vec3 colorBright;
    varying vec2 vUvs;
  
    const float MAX_INTENSITY = 1.1;
    const float MIN_INTENSITY = 0.8;

    // Normalized wave function to create the pulsating rings
    // time allows the wave to move
    // dist modulated by intensity controls the wave length. 
    float wave(in float dist) {
        float sinWave = 0.5 * (sin(-time * 6.0 + dist * 10.0 * intensity) + 1.0);

        // Controls the max intensity and min intensity of the wave
        // The wave is bound between these two values
        // Alternating between 0.8 and 1.1 (see const values)
        // the wave must be normalized before (values between 0 and 1)
        return ((MAX_INTENSITY - MIN_INTENSITY) * sinWave) + MIN_INTENSITY;
    }
  
    void main() {
        // distance of the current coordinate from the center
        // multiplied by two to have a distance of 1 for the maximum distance value of a bounding inner circle of the quad
        // so, the maximum distance from the center is around 1.45 for the vertices of the quad.
        float dist = distance(vUvs, vec2(0.5)) * 2.0;

        // mix is a linear interpolation between two scalars (here, vec3), which is weighted by a third value
        // step is a kind of if : if ratio is inferior to dist, then it returns 0, else it returns 1.
        // with weight 0, the returned color is colorBright
        // with weight 1, it's colorDim.
        // this is not case here, but if the weight was 0.5, the returned color would be a balanced mix of the two colors
        // the color (which is a scalar : vec3), is mutiplied by the wave function.
        vec3 color = mix(colorDim, colorBright, step(dist, ratio)) * wave(dist);
        gl_FragColor = vec4(color * alpha, 1.0);
    }`;
}

/**
 * Wave animation coloration shader
 * @implements {StandardColorationShader}
 * @author SecretFire
 */
class CLCustomWaveColorationShader extends StandardColorationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform vec3 color;
    varying vec2 vUvs;
  
    const float MAX_INTENSITY = 1.35;
    const float MIN_INTENSITY = 0.8;
  
    ${AbstractBaseShader.FADE(4, 0.90)}
  
    float wave(in float dist) {
        float sinWave = 0.5 * (sin(-time * 6.0 + dist * 10.0 * intensity) + 1.0);
        return ((MAX_INTENSITY - MIN_INTENSITY) * sinWave) + MIN_INTENSITY;
    }
  
    void main() {
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        float wfade = fade(dist) * wave(dist);
        gl_FragColor = vec4(color, 1.0) * wfade * alpha;
    }`;
}

/**
 * Force grid animation coloration shader
 * @implements {StandardColorationShader}
 * @author SecretFire
 */
class CLForceGridColorationShader extends StandardColorationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform vec3 color;
    varying vec2 vUvs;

    const float MAX_INTENSITY = 1.2;
    const float MIN_INTENSITY = 0.8;

    vec2 hspherize(in vec2 uv, in float dist) {
        float f = (1.0 - sqrt(1.0 - dist)) / dist;
        uv -= vec2(0.50);
        uv *= f * 5.0;
        uv += vec2(0.5);
        return uv;
    }

    float wave(in float dist) {
        float sinWave = 0.5 * (sin(time * 6.0 + pow(1.0 - dist, 0.10) * 35.0 * intensity) + 1.0);
        return ((MAX_INTENSITY - MIN_INTENSITY) * sinWave) + MIN_INTENSITY;
    }

    float fpert(in float d, in float p) {
        return max(0.3 - 
                   mod(p + time + d * 0.3, 3.5),
                   0.0) * intensity * 2.0;
    }

    float pert(in vec2 uv, in float dist, in float d, in float w) {
        uv -= vec2(0.5);
        float f = fpert(d, min( uv.y,  uv.x)) +
	              fpert(d, min(-uv.y,  uv.x)) +
	              fpert(d, min(-uv.y, -uv.x)) +
	              fpert(d, min( uv.y, -uv.x));
        f *= f;
        return max(f, 3.0 - f) * w;
    }

    vec4 forcegrid(vec2 suv, in float dist)
    {
        vec2 uv = suv - vec2(0.205, 0.205);
        vec2 cid2 = floor(uv);
        float cid = (cid2.y + cid2.x);
	
        uv = fract(uv);
        float r = 0.3;
        float d = 1.0;
        float e;
	
        const int it = 7;
        for(int i = 0; i < it; i++) {
	        e = uv.x - r;
	        d += pow(clamp(1.0 - abs(e * 0.75), 0.0, 1.0), 200.0);
	        if(e > 0.0) {
		        uv.x = (uv.x - r) / (2.0 - r);
	        } 
	        uv = uv.yx;
        }

        float w = wave(dist);
        vec3 col = vec3(max(d - 1.0, 0.0)) * 1.8;
        col *= pert(suv, dist, d, w);
        col += color * 0.70 * w;
	
        return vec4(col * color, 1.0);
    }

    void main() {
        float dist = distance(vUvs, vec2(0.50)) * 2.0;
        vec2 uv = hspherize(vUvs, dist);
        float fade = pow(1.0 - dist, 0.20);
        gl_FragColor = forcegrid(uv, dist) * fade * alpha;
    }
    `;
}

/**
 * Smoke patch animation coloration shader
 * @implements {StandardColorationShader}
 * @author SecretFire
 */
class CLSmokePatchColorationShader extends StandardColorationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform vec3 color;
    varying vec2 vUvs;

    ${AbstractBaseShader.PRNG}
    ${AbstractBaseShader.NOISE}
    ${AbstractBaseShader.FBM(2)}

    float smokefading(in float dist) {
        float t = time * 0.4;
        vec2 uv = vUvs * 10.0;
        return pow(1.0 - dist, 
                   mix( 0.20, 
                        max( fbm(uv + t),
                             fbm(uv - t)), 
                        pow(dist, intensity * 0.5))) *
                        pow(1.0 - dist, 0.20);
    }

    void main() {
        float dist = distance(vUvs, vec2(0.50)) * 2.0;
        gl_FragColor = vec4(color, 1.0) * smokefading(dist) * alpha;
    }
    `;
}

/**
 * Smoke patch animation illumination shader
 * @implements {StandardIlluminationShader}
 * @author SecretFire
 */
class CLSmokePatchIlluminationShader extends StandardIlluminationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform float ratio;
    uniform vec3 colorDim;
    uniform vec3 colorBright;
    varying vec2 vUvs;

    ${AbstractBaseShader.PRNG}
    ${AbstractBaseShader.NOISE}
    ${AbstractBaseShader.FBM(2)}

    float smokefading(in float dist) {
        float t = time * 0.4;
        vec2 uv = vUvs * 10.0;
        return pow(1.0 - dist,
            mix(0.20,
                max(fbm(uv + t),
                    fbm(uv - t)),
                pow(dist, intensity * 0.5))) *
                pow(1.0 - dist, 0.20);
    }

    void main() {
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        vec3 color = mix(colorDim, 
                         colorBright,
                         smoothstep(
                             clamp(1.0 - ratio - 0.1, 0.0, 1.0),
                             clamp(1.0 - ratio + 0.1, 0.0, 1.0),
                             1.0 - dist));
        gl_FragColor = vec4(color * smokefading(dist) * alpha, 1.0);
    }`;
}

/**
 * Star Light animation coloration shader
 * @implements {StandardColorationShader}
 * @author SecretFire
 */
class CLStarLightColorationShader extends StandardColorationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform float musicwave;
    uniform bool musicmode;
    uniform vec3 color;
    uniform vec3 scolor;
    varying vec2 vUvs;

    ${AbstractBaseShader.PRNG}
    ${AbstractBaseShader.NOISE}
    ${AbstractBaseShader.FBM(2)}

    vec2 transform(in vec2 uv, in float dist) {
        float t = time * 0.40;
        float cost = cos(t);
        float sint = sin(t);
    
        mat2 rotmat = mat2(cost, -sint, sint, cost);
        uv *= rotmat;
        return uv;
    }

    float makerays(in vec2 uv, in float t) {
        float sw = (musicmode ? musicwave * (intensity * 0.1) : intensity);
        vec2 uvn = normalize(uv * (uv + t)) * (5.0 + sw);
        return max(clamp(0.5 * tan(fbm(uvn - t)), 0.0, 2.25),
                   clamp(3.0 - tan(fbm(uvn + t * 2.0)), 0.0, 2.25));
    }

    float starlight(in float dist) {
        //float t = time;
        vec2 uv = (vUvs - 0.5);
        uv = transform(uv, dist);
        float rays = makerays(uv, time);
        return pow(1.0 - dist, rays) * pow(1.0 - dist, 0.25);
    }

    void main() {
        float dist = distance(vUvs, vec2(0.50)) * 2.0;
        vec3 fcolor = mix(scolor, 
                          color,
                          clamp(1.0 - dist, 0.0, 1.0)) * musicwave;
        gl_FragColor = vec4(clamp(fcolor * starlight(dist) * alpha, 0.0, 1.0), 1.0);
    }
    `;

    static defaultUniforms = mergeObject(super.defaultUniforms, {
        musicwave: 1,
        scolor: [1.0, 1.0, 0.0],
        musicmode: false,
    });
}

/**
 * Reusable smooth transition illumination shader
 * @implements {StandardIlluminationShader}
 * @author SecretFire
 */
class CLSmoothTransitionIlluminationShader extends StandardIlluminationShader {
    static fragmentShader = `
    precision mediump float;
    uniform float time;
    uniform float intensity;
    uniform float alpha;
    uniform float ratio;
    uniform vec3 colorDim;
    uniform vec3 colorBright;
    varying vec2 vUvs;

    void main() {
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        vec3 color = mix(colorDim, 
                         colorBright,
                         smoothstep(
                             clamp(0.8 - ratio, 0.0, 1.0),
                             clamp(1.2 - ratio, 0.0, 1.0),
                             1.0 - dist));
        gl_FragColor = vec4(color * alpha, 1.0);
    }`;
}

