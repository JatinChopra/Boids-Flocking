import { useEffect, useRef } from "react";
import run from "./world/run";
import * as THREE from "three";
import { SceneInit } from "./lib/SceneManager";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let w: SceneInit;

  function playBgMusic(world: SceneInit) {
    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("8-bit-air-fight.mp3", function (buffer) {
      world.sound.setBuffer(buffer);
      world.sound.setLoop(true);
      world.sound.setVolume(0.5);
      world.sound.play();
    });
  }

  useEffect(() => {
    const world = run(canvasRef.current as HTMLCanvasElement);
    w = world;

    return () => {
      world.gui.destroy();
      // world.orbctrls.dispose();
    };
  });

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <canvas ref={canvasRef} className="min-h-screen w-full"></canvas>

      <button
        id="startButton"
        className="absolute  inset-x-0 top-[70%] p-10 font-bold text-2xl text-white"
        onClick={() => {
          if (w) playBgMusic(w);
        }}
      >
        START
      </button>
    </div>
  );
}

export default App;
