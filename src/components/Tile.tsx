'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
}

export const Tile = ({ tile }: TileProps) => {
  // Posição percentual baseada no grid 4x4 (25% por célula)
  const top = `${tile.row * 25}%`;
  const left = `${tile.col * 25}%`;

  return (
    <motion.div
      layout
      initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
      animate={{
        scale: tile.isNew ? [0, 1.15, 1] : 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
        ease: 'easeOut',
      }}
      className="absolute w-[25%] h-[25%] p-1.5 flex items-center justify-center pointer-events-none"
      style={{ top, left }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Efeito Glow / Brilho Dourado para Peças Novas */}
        {tile.isNew && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: [0.8, 0.3, 0], scale: [0.8, 1.3, 1.4] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-amber-400 blur-md pointer-events-none z-0"
          />
        )}

        {/* Garrafa com filtro de brilho se for nova */}
        <div
          className={`relative w-full h-full transition-all duration-300 ${
            tile.isNew ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]' : ''
          }`}
        >
          <Image
            src={`/assets/bottles/bottle_${String(tile.value).padStart(2, '0')}.png`} // Transforma 1 em 'bottle_01.png'
            alt={`Garrafa ${tile.value}`}
            fill
            unoptimized
            className="object-contain z-10"
            />
        </div>

        {/* Badge com o nível da garrafa */}
        <span className="absolute bottom-0 right-0 bg-black/70 text-amber-200 border border-amber-500/50 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full z-20 shadow-md">
          {tile.value}
        </span>
      </div>
    </motion.div>
  );
};