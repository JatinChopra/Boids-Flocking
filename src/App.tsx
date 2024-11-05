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
    <div className="bg-green-500 min-h-screen w-full">
      <canvas ref={canvasRef} className="min-h-screen w-full"></canvas>
      <button
        className="absolute bottom-10 right-10 text-white font-bold"
        onClick={() => {
          if (w) playBgMusic(w);
        }}
      >
        Music
      </button>
    </div>
  );
}

export default App;
