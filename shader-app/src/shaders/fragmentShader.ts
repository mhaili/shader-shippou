export const fragmentShader = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uClick;
uniform int uMode;

varying vec2 vUv;

// Hash function
float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float circle(vec2 uv, float r) {
    return length(uv) - r;
}

float shippouPattern(vec2 p) {
    vec2 gv = fract(p * 4.0) - 0.5;
    vec2 id = floor(p * 4.0);
    
    float variation = hash21(id) * 0.05;
    float radius = 0.35 + variation;
    
    float c1 = circle(gv, radius);
    float c2 = circle(gv + vec2(1.0, 0.0), radius);
    float c3 = circle(gv + vec2(-1.0, 0.0), radius);
    float c4 = circle(gv + vec2(0.0, 1.0), radius);
    float c5 = circle(gv + vec2(0.0, -1.0), radius);
    
    float pattern = min(c1, min(c2, min(c3, min(c4, c5))));
    return smoothstep(0.02, -0.02, pattern);
}


vec3 renderEye(vec2 uv, vec2 center, float size) {
    vec2 toEye = (uv - center) / size;
    float eyeDist = length(toEye);
    
    if(eyeDist > 0.5) return vec3(0.0);
    

    vec2 mouseDir = (uMouse - 0.5) * 0.35;
    
    // suivi souris
    vec2 irisCenter = mouseDir + 0.08 * vec2(
        sin(uTime * 0.8 + center.x * 15.0), 
        cos(uTime * 0.6 + center.y * 12.0)
    );
    

    irisCenter = clamp(irisCenter, vec2(-0.2), vec2(0.2));
    
    float irisDist = length(toEye - irisCenter);
    float pupilDist = length(toEye - irisCenter);
    

    float irisRadius = 0.16;
    float pupilRadius = 0.06 + 0.02 * sin(uTime * 1.5);
    
    // Couleurs selon le mode
    vec3 scleraColor = vec3(0.96, 0.96, 0.98);
    vec3 irisColor;
    
    if(uMode == 0) {
        irisColor = vec3(0.45, 0.65, 0.35);  // Vert naturel
    } else if(uMode == 1) {
        irisColor = vec3(0.25, 0.45, 0.85);  // Bleu profond
    } else {
        irisColor = vec3(0.75, 0.35, 0.25);  // Marron chaleureux
    }
    
    float irisPattern = noise(toEye * 12.0 + uTime * 0.3);
    irisColor = mix(irisColor, irisColor * 1.3, irisPattern * 0.25);
    

    vec3 eyeColor = scleraColor;
    
    // Iris
    if(irisDist < irisRadius) {
        float irisMask = smoothstep(irisRadius, irisRadius - 0.02, irisDist);
        eyeColor = mix(eyeColor, irisColor, irisMask);
    }
    
    // Pupille
    if(pupilDist < pupilRadius) {
        float pupilMask = smoothstep(pupilRadius, pupilRadius - 0.01, pupilDist);
        eyeColor = mix(eyeColor, vec3(0.0), pupilMask);
    }
    
    vec2 reflectPos = irisCenter + vec2(-0.04, -0.04);
    float reflectDist = length(toEye - reflectPos);
    if(reflectDist < 0.025) {
        float reflectMask = smoothstep(0.025, 0.015, reflectDist);
        eyeColor = mix(eyeColor, vec3(1.0), reflectMask * 0.9);
    }
    

    if(uClick > 0.1) {
        float flashIntensity = uClick * exp(-eyeDist * 2.5);
        vec3 flashColor = vec3(1.0, 0.95, 0.8);
        eyeColor += flashColor * flashIntensity * 0.5;
    }
    
    // Paupières avec clignement
    float blinkAmount = 0.08 + uClick * 0.35;
    float upperLid = smoothstep(-0.35 + blinkAmount, -0.25 + blinkAmount, -toEye.y);
    float lowerLid = smoothstep(-0.35 + blinkAmount, -0.25 + blinkAmount, toEye.y);
    
    float eyeMask = smoothstep(0.5, 0.47, eyeDist) * upperLid * lowerLid;
    return eyeColor * eyeMask;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    
    // Background
    float shippouBase = shippouPattern(uv);
    float shippouDetail = shippouPattern(uv * 2.0) * 0.3;
    float shippou = shippouBase + shippouDetail;
    
    // Couleurs de background par mode
    vec3 bgColor;
    if(uMode == 0) {
        bgColor = mix(vec3(0.96, 0.93, 0.87), vec3(0.68, 0.38, 0.42), shippou);
    } else if(uMode == 1) {
        bgColor = mix(vec3(0.87, 0.92, 0.98), vec3(0.32, 0.22, 0.72), shippou);
    } else {
        bgColor = mix(vec3(0.98, 0.91, 0.84), vec3(0.82, 0.43, 0.23), shippou);
    }
    
    vec3 finalColor = bgColor;
    
    // Génération des yeux 
    for(int i = 0; i < 32; i++) {
        float fi = float(i);
        vec2 seed = vec2(fi * 7.234, fi * 13.567);
        
        // Positionaléatoire
        vec2 eyePos = (vec2(hash21(seed), hash21(seed + 1.0)) - 0.5) * 2.8;
        
        eyePos += 0.12 * vec2(
            sin(uTime * 0.7 + fi * 0.8),
            cos(uTime * 0.5 + fi * 0.6)
        );
        
        float eyeSize = 0.18 + 0.06 * hash21(seed + 2.0);
        
        vec3 eyeColor = renderEye(uv, eyePos, eyeSize);
        
        finalColor += eyeColor;
    }
    
    finalColor = pow(finalColor, vec3(0.96));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;