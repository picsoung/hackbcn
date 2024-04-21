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
            --gradient-color-1: #411032; /* Deep Purple */
            --gradient-color-2: #C2533C; /* Rich Reddish-Pink */
            --gradient-color-3: #010001; /* Almost Black */
            --gradient-color-4: #72226E; /* Darker Purple */
            --gradient-color-5: #CD65C1; /* Vibrant Pinkish-Purple */
            
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
