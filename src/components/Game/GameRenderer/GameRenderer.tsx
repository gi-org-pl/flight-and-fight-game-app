import Phaser from "phaser";
import { useEffect, useRef } from "react";
import { createGameConfig } from "./utils/createGameConfig";

interface Props {
  className?: string;
}

const GameRenderer = ({ className }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game(createGameConfig(containerRef.current));

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

export default GameRenderer;
