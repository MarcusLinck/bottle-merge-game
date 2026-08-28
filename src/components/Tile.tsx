'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
}

export const Tile = ({ tile }: TileProps) => {
  const top = `${tile.row * 25}%`;
  const left = `${tile.col * 25}%`;

  return (
    <motion.div
      layout
      initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
      animate={{
        scale: tile.isMerged
          ? [1, 1.25, 0.95, 1]
          : tile.isNew
          ? [0, 1.15, 1]
          : 1,
        opacity: tile.mergedIntoId ? 0.8 : 1,
      }}
      exit={{ opacity: 0 }}
      transition={{
        layout: { duration: 0.15, ease: 'easeOut' },
        scale: { duration: tile.isMerged ? 0.22 : 0.15, ease: 'easeOut' },
      }}
      className={`absolute w-[25%] h-[25%] p-1.5 flex items-center justify-center pointer-events-none ${
        tile.mergedIntoId ? 'z-10' : 'z-20'
      }`}
      style={{ top, left }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Glow de Peça Nova */}
        {tile.isNew && (
          <motion.div
            initial={{ opacity: 1, scale: 0.4 }}
            animate={{ opacity: [1, 0.8, 0], scale: [0.4, 1.6, 2] }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-amber-300/80 shadow-[0_0_20px_rgba(252,211,77,0.9)] blur-md pointer-events-none z-20"
          />
        )}

        {/* Fumaça de Fusão (Estoura exatamente no tile final após a colisão) */}
        {tile.isMerged && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9, filter: 'blur(2px)' }}
              animate={{ scale: [0.2, 1.6, 2.2], opacity: [0.9, 0.5, 0], filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute w-14 h-14 rounded-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.9)]"
            />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const distance = 30 + (i % 2) * 6;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.85, x: 0, y: 0, scale: 0.7 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos(rad) * distance,
                    y: Math.sin(rad) * distance,
                    scale: [0.7, 1.1, 0.1],
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute w-3.5 h-3.5 rounded-full bg-white/80 blur-[1px]"
                />
              );
            })}
          </div>
        )}

        {/* Garrafa */}
        <div className="relative w-full h-full">
          <Image
            src={`/assets/bottles/bottle_${String(tile.value).padStart(2, '0')}.png`}
            alt={`Garrafa ${tile.value}`}
            fill
            unoptimized
            className="object-contain z-10"
          />
        </div>

        {/* Badge do nível */}
        {!tile.mergedIntoId && (
          <motion.span
            animate={{ scale: tile.isMerged ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 right-0 bg-black/80 text-amber-200 border border-amber-500/60 text-[9px] min-[380px]:text-xs font-black px-1 sm:px-1.5 py-0.5 rounded-full z-20 shadow-md pointer-events-none leading-none"
          >
            {tile.value}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};