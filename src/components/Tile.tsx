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
        scale: tile.isMerged
          ? [1, 1.35, 0.9, 1.05, 1] // Impacto de fusão (Rubber band effect)
          : tile.isNew
          ? [0, 1.15, 1] // Animação de entrada da nova peça
          : 1,
        rotate: tile.isMerged ? [0, -6, 6, -2, 0] : 0, // Tremida de colisão
        opacity: 1,
      }}
      exit={{ opacity: 0, scale: 0.5 }} // Transição ao ser fundida/removida
      transition={{
        layout: { duration: 0.18, ease: 'easeOut' }, // Velocidade do movimento deslizando
        scale: { duration: tile.isMerged ? 0.3 : 0.2, ease: 'easeOut' },
        rotate: { duration: 0.3, ease: 'easeOut' },
      }}
      className="absolute w-[25%] h-[25%] p-1.5 flex items-center justify-center pointer-events-none z-10"
      style={{ top, left }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 1. Glow para Garrafas Novas */}
        {tile.isNew && (
          <motion.div
            initial={{ opacity: 0.9, scale: 0.7 }}
            animate={{ opacity: [0.9, 0.2, 0], scale: [0.7, 1.4, 1.6] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-amber-400 blur-md pointer-events-none z-0"
          />
        )}

        {/* 2. Onda de Choque Anular na Fusão (Shockwave) */}
        {tile.isMerged && (
          <motion.div
            initial={{ opacity: 1, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-amber-300 bg-amber-400/30 blur-sm pointer-events-none z-0"
          />
        )}

        {/* 3. Partículas/Faíscas ao Fundir */}
        {tile.isMerged && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {[0, 90, 180, 270].map((deg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: Math.cos((deg * Math.PI) / 180) * 32,
                  y: Math.sin((deg * Math.PI) / 180) * 32,
                  scale: 0.2,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fbbf24]"
              />
            ))}
          </div>
        )}

        {/* Garrafa com sombra colorida vibrante */}
        <div
          className={`relative w-full h-full transition-all duration-300 ${
            tile.isMerged
              ? 'drop-shadow-[0_0_18px_rgba(251,191,36,1)] scale-105'
              : tile.isNew
              ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]'
              : ''
          }`}
        >
          <Image
            src={`/assets/bottles/bottle_${String(tile.value).padStart(2, '0')}.png`}
            alt={`Garrafa ${tile.value}`}
            fill
            unoptimized
            className="object-contain z-10"
          />
        </div>

        {/* Badge do nível da garrafa */}
        <motion.span
          animate={{
            scale: tile.isMerged ? [1, 1.4, 1] : 1,
          }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 right-0 bg-black/80 text-amber-200 border border-amber-500/60 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full z-20 shadow-md"
        >
          {tile.value}
        </motion.span>
      </div>
    </motion.div>
  );
};