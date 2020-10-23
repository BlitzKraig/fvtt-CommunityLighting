/**
 * Wave animation illumination shader
 * @implements {StandardIlluminationShader}
 * @author SecretFire
 */
class CustomWaveIlluminationShader extends StandardIlluminationShader {
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

    float wave(in float dist) {
        float sinWave = 0.5 * (sin(-time * 6.0 + dist * 10.0 * intensity) + 1.0);
        return ((MAX_INTENSITY - MIN_INTENSITY) * sinWave) + MIN_INTENSITY;
    }
  
    void main() {
        float dist = distance(vUvs, vec2(0.5)) * 2.0;
        vec3 color = mix(colorDim, colorBright, step(dist, ratio)) * wave(dist);
        gl_FragColor = vec4(color * alpha, 1.0);
    }`;
  }
  
  /**
   * Wave animation coloration shader
   * @implements {StandardColorationShader}
   * @author SecretFire
   */
  class CustomWaveColorationShader extends StandardColorationShader {
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