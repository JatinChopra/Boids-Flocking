import { useEffect, useRef } from "react";
import run from "./world/run";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const world = run(canvasRef.current as HTMLCanvasElement);

    return () => {
      world.gui.destroy();
      world.orbctrls.dispose();
    };
  });

  return (
    <div className="bg-green-500 min-h-screen w-full">
      <canvas ref={canvasRef} className="min-h-screen w-full"></canvas>
    </div>
  );
}

export default App;
