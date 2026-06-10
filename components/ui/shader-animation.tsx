
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// The shaders are constants and don't need to be inside the component
const vertexShader = `
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`;

const fragmentShader = `
  #define TWO_PI 6.2831853072
  #define PI 3.14159265359

  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  // Greatek brand colors
  vec3 color1 = vec3(0.0, 0.506, 0.8);      // #0081cc greatek-blue
  vec3 color2 = vec3(0.031, 0.247, 0.384);  // #083f62 greatek-dark-blue
  vec3 color3 = vec3(0.388, 0.722, 0.906);  // #63B8E7 greatek-light-blue

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float t = time * 0.05;
    float lineWidth = 0.003;

    vec3 finalColor = vec3(0.0);
    
    float intensity1 = 0.0;
    for(int i=0; i < 5; i++){
      intensity1 += lineWidth*float(i*i) / abs(fract(t + float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
    }
    finalColor += intensity1 * color1;

    float intensity2 = 0.0;
    for(int i=0; i < 5; i++){
      intensity2 += lineWidth*float(i*i) / abs(fract(t*0.9 + float(i)*0.015)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
    }
    finalColor += intensity2 * color2;

    float intensity3 = 0.0;
    for(int i=0; i < 5; i++){
        intensity3 += lineWidth*float(i*i) / abs(fract(t*1.1 + float(i)*0.02)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
    }
    finalColor += intensity3 * color3;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect runs on mount. In React.StrictMode, it runs, cleans up, and runs again.
    // A robust cleanup is essential to handle this without losing the WebGL context.
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let renderer: THREE.WebGLRenderer | null = null;

    // --- Scene Setup ---
    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Renderer Setup ---
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
    } catch (error) {
      console.warn("WebGLRenderer initialization failed:", error);
      // Clean up resources if renderer creation fails
      geometry.dispose();
      material.dispose();
      return;
    }

    // --- Event Listeners & Animation Loop ---
    const onWindowResize = () => {
      if (!container || !renderer) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // The cleanup function is critical for preventing resource leaks.
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onWindowResize);
      
      // Dispose of Three.js resources to free GPU memory.
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      
      if (renderer) {
        // Ensure context is lost to prevent "Too many active WebGL contexts" error
        renderer.forceContextLoss();
        renderer.dispose();
        
        // Cleanly remove the now-defunct canvas from the DOM.
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount.

  return (
    <div
      ref={containerRef}
      className="w-full h-screen"
      style={{
        background: "#083f62", // Fallback color if WebGL fails
        overflow: "hidden",
      }}
    />
  );
}
