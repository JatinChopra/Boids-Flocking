import { useEffect, useRef } from "react";
import run from "./world/run";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { world, group0 } = run(canvasRef.current as HTMLCanvasElement);

    const keyPressHandler = (e: KeyboardEvent) => {
      console.log(e.key);
      if (e.key == "n") {
        group0.addNewBoid();
      }
    };

    window.addEventListener("keypress", keyPressHandler);

    return () => {
      world.gui.destroy();
      world.orbctrls.dispose();
      window.removeEventListener("keypress", keyPressHandler);
    };
  });

  return (
    <div className="bg-green-500 min-h-screen w-full">
      <canvas ref={canvasRef} className="min-h-screen w-full"></canvas>
    </div>
  );
}

export default App;
