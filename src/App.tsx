import { useEffect, useRef } from "react";
import run from "./world/run";
import * as THREE from "three";
import { SceneInit } from "./lib/SceneManager";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let wrld: SceneInit;

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
    wrld = world;

    function windowResizeHandler() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (world.cam.aspect != w / h) {
        world.cam.aspect = w / h;
        world.cam.updateProjectionMatrix();
        world.re.setSize(w, h);
        world.render();
      }
    }
    window.addEventListener("resize", windowResizeHandler);

    return () => {
      window.removeEventListener("resize", windowResizeHandler);
      world.gui.destroy();
      // world.orbctrls.dispose();
    };
  });

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <canvas ref={canvasRef} className="min-h-screen w-full"></canvas>
      <div
        id="desc"
        className="absolute top-20 flex flex-col items-center justify-center gap-5 "
      >
        <p className="max-w-[90%] text-white  text-center backdrop-blur-lg">
          A simulation that replicates the flocking behavior seen in nature,
          similar to how birds and fish move cohesively in groups.
        </p>

        <p className="w-[90%]  text-gray-400 fontbold text-center backdrop-blur-lg ">
          In this simulation, three distinct groups of boids—colored orange,
          cyan , and pink —exhibit flocking behaviors while interacting with a
          predator. The cyan group is targeted by the predator, which actively
          chases them and launches projectiles to eliminate boids. The other two
          groups are not targeted directly but still respond by fleeing if the
          predator enters their escape range, creating dynamic movement patterns
          across all groups.
        </p>
      </div>
      <button
        id="startButton"
        className="absolute border-2 top-[70%] p-5 font-bold text-2xl text-white hover:bg-black hover:bg-opacity-30"
        onClick={() => {
          if (wrld) playBgMusic(wrld);
        }}
      >
        START
      </button>
      <div className="absolute left-5 bottom-3 text-gray-600">
        Music by{" "}
        <a
          href="https://pixabay.com/users/moodmode-33139253/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=158813"
          className="underline"
          target="_blank"
        >
          Vlad Krotov
        </a>{" "}
        from{" "}
        <a
          href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=158813"
          target="_blank"
          className="underline"
        >
          Pixabay
        </a>
      </div>
      <div className="absolute bottom-3 right-5 flex pt-5 gap-5">
        <a
          href={"https://github.com/JatinChopra/Boids-Flocking"}
          target="_blank"
        >
          <img src={"/social/github.png"} className="w-8 h-8 object-cover" />
        </a>
        <a href={"https://x.com/0xJatinChopra"} target="_blank">
          <img src={"/social/twitter.png"} className="w-8 h-8 object-cover" />
        </a>
        <a
          href={"https://www.linkedin.com/in/jatin-chopra-15a792188/"}
          target="_blank"
        >
          <img src={"/social/linkedin.png"} className="w-8 h-8 object-cover" />
        </a>
      </div>
    </div>
  );
}

export default App;
