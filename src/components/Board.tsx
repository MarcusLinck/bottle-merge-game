'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Tile } from './Tile';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const Board = () => {
  // 👇 Adicionado movesCount da store
  const { tiles, initGame, move, score, movesCount, gameOver } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (tiles.length === 0) {
      initGame();
    }
  }, [initGame, tiles.length]);

  useEffect(() => {
    if (gameOver) {
      setShowModal(true);
    }
  }, [gameOver]);

  const handleInitGame = () => {
    setShowModal(false);
    isAnimatingRef.current = false;
    initGame();
  };

  const handleAttemptMove = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) {
      setShowModal(true);
      return;
    }

    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    move(direction);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleAttemptMove('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleAttemptMove('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleAttemptMove('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleAttemptMove('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  const bind = useGesture({
    onDragEnd: ({ swipe: [swipeX, swipeY] }) => {
      if (swipeX === 1) handleAttemptMove('RIGHT');
      else if (swipeX === -1) handleAttemptMove('LEFT');
      else if (swipeY === 1) handleAttemptMove('DOWN');
      else if (swipeY === -1) handleAttemptMove('UP');
    },
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Cabeçalho de Placar com Pontos e Jogadas */}
      <div className="flex justify-between items-center w-full max-w-md px-2">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pontos</span>
            <span className="text-2xl font-black text-amber-200 leading-none">{score}</span>
          </div>
          
          <div className="w-[1px] h-8 bg-amber-700/50" />

          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Jogadas</span>
            <span className="text-2xl font-black text-amber-200 leading-none">{movesCount}</span>
          </div>
        </div>

        <button
          onClick={handleInitGame}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition transform active:scale-95"
        >
          Reiniciar
        </button>
      </div>

      {/* Tabuleiro */}
      <div
        {...bind()}
        className="relative w-[460px] h-[460px] sm:w-[560px] sm:h-[560px] touch-none select-none shadow-2xl rounded-2xl overflow-hidden"
      >
        <Image
          src="/assets/board_bg.png"
          alt="Tabuleiro"
          fill
          unoptimized
          priority
          className="object-contain pointer-events-none"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            top: '10.8%',
            bottom: '10.8%',
            left: '10.8%',
            right: '10.8%',
          }}
        >
          <div className="relative w-full h-full">
            {tiles.map((tile) => (
              <Tile key={tile.id} tile={tile} />
            ))}
          </div>
        </div>

        {/* Modal de Game Over com estatísticas atualizadas */}
        <AnimatePresence>
          {gameOver && showModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <h2 className="text-3xl font-black text-amber-400 mb-2">Fim de Jogo!</h2>
              <p className="text-gray-300 mb-4 font-semibold">Sem movimentos disponíveis.</p>

              <div className="flex gap-3 mb-6">
                <div className="bg-amber-900/50 border border-amber-600/40 rounded-xl px-5 py-3">
                  <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                    Pontuação
                  </span>
                  <span className="text-3xl font-extrabold text-white">{score}</span>
                </div>

                <div className="bg-amber-900/50 border border-amber-600/40 rounded-xl px-5 py-3">
                  <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                    Jogadas
                  </span>
                  <span className="text-3xl font-extrabold text-white">{movesCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={handleInitGame}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 text-lg font-black py-3 rounded-xl shadow-lg transition transform active:scale-95"
                >
                  Jogar Novamente
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border border-amber-600/50 text-sm font-bold py-2.5 rounded-xl transition transform active:scale-95"
                >
                  Ver Tabuleiro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};