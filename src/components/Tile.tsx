'use client';

import { Tile as TileType } from '@/types/game';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TileProps {
  tile: TileType;
}

export const Tile = ({ tile }: TileProps) => {
  const imageNumber = String(tile.value).padStart(2, '0');
  const imagePath = `/assets/bottles/bottle_${imageNumber}.png`;

  return (
    <motion.div
      layoutId={tile.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        top: `${tile.row * 25}%`,
        left: `${tile.col * 25}%`,
      }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 26,
      }}
      className="absolute w-1/4 h-1/4 p-1.5 z-10 select-none pointer-events-none"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={imagePath}
          alt={`Garrafa Nível ${tile.value}`}
          fill
          unoptimized
          sizes="160px"
          className="w-[90%] h-[90%] object-contain drop-shadow-md"
          priority
        />
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full border border-white/30 shadow">
          {tile.value}
        </span>
      </div>
    </motion.div>
  );
};