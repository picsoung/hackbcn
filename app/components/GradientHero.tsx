import { useEffect } from "react";
import { Gradient } from "./Gradient.js";

export default function GradientHero() {
  useEffect(() => {
    // Create your instance
    const gradient = new Gradient();

    // Call `initGradient` with the selector to your canvas
    gradient.initGradient("#gradient-canvas");
  });

  return (
    <>
      <style>
        {`
            #gradient-canvas {
            width:100%;
            height:100%;
            --gradient-color-1: #1E5631; /* Rich Emerald */
            --gradient-color-2: #76B041; /* Vibrant Leaf Green */
            --gradient-color-3: #50C878; /* Glowing Emerald Green */
            --gradient-color-4: #122B26; /* Hunter Green */
            
            }
         `}
      </style>
      <canvas
        className="-z-10 fixed top-0 left-0 bottom-0 right-0"
        id="gradient-canvas"
        data-transition-in
      />
    </>
  );
}
