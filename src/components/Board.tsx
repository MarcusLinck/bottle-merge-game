'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Tile } from './Tile';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const Board = () => {
  const { tiles, initGame, move, score, movesCount, gameOver } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [showControls, setShowControls] = useState(false);
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
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      switch (key) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          handleAttemptMove('UP');
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          handleAttemptMove('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          handleAttemptMove('LEFT');
          break;
        case 'arrowright':
        case 'd':
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
    <div className="flex flex-col items-center justify-between w-full max-w-[440px] mx-auto h-full max-h-[98vh] py-2 px-2 select-none touch-none">
      
      {/* 1. CABEÇALHO DA INTERFACE */}
      <header className="w-full flex flex-col gap-2 mb-2">
        {/* Linha 1: Título & Botões */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-black text-amber-400 uppercase tracking-wider drop-shadow-md leading-none">
              Bottle Merge
            </h1>
            <span className="text-[10px] sm:text-xs text-amber-200/60 font-medium">
              Combine as garrafas!
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowControls((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1 shadow-sm active:scale-95 ${
                showControls
                  ? 'bg-amber-500 text-amber-950 border-amber-300'
                  : 'bg-amber-950/60 text-amber-200 border-amber-700/60 hover:bg-amber-900/60'
              }`}
            >
              <span>🎮</span>
              <span className="text-[10px] sm:text-xs">{showControls ? 'Ocultar' : 'Setas'}</span>
            </button>

            <button
              onClick={handleInitGame}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition transform active:scale-95 border border-amber-400/30"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Linha 2: Cards de Pontuação */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="bg-amber-950/60 border border-amber-700/40 rounded-xl py-1.5 px-3 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
              Pontos
            </span>
            <span className="text-base sm:text-xl font-black text-amber-100 leading-none mt-1">
              {score}
            </span>
          </div>

          <div className="bg-amber-950/60 border border-amber-700/40 rounded-xl py-1.5 px-3 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
              Jogadas
            </span>
            <span className="text-base sm:text-xl font-black text-amber-100 leading-none mt-1">
              {movesCount}
            </span>
          </div>
        </div>
      </header>

      {/* 2. TABULEIRO PRINCIPAL (RELAÇÃO ASPECT-SQUARE PERFEITA) */}
      <div className="w-full flex items-center justify-center my-auto">
        <div
          {...bind()}
          className="relative w-full max-w-[440px] aspect-square touch-none select-none shadow-2xl rounded-2xl overflow-hidden border border-amber-900/40"
        >
          <Image
            src="/assets/board_bg.png"
            alt="Tabuleiro"
            fill
            unoptimized
            priority
            className="object-contain pointer-events-none"
          />

          {/* Grid de Garrafas alinhado com as pedras do fundo */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '10.5%',
              bottom: '10.5%',
              left: '10.5%',
              right: '10.5%',
            }}
          >
            <div className="relative w-full h-full">
              <AnimatePresence>
                {tiles.map((tile) => (
                  <Tile key={tile.id} tile={tile} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Modal de Game Over */}
          <AnimatePresence>
            {gameOver && showModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
              >
                <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mb-1">Fim de Jogo!</h2>
                <p className="text-amber-200/80 mb-4 text-xs font-medium">Sem movimentos disponíveis.</p>

                <div className="flex gap-3 mb-6">
                  <div className="bg-amber-950/80 border border-amber-600/40 rounded-xl px-4 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                      Pontuação
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white">{score}</span>
                  </div>

                  <div className="bg-amber-950/80 border border-amber-600/40 rounded-xl px-4 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                      Jogadas
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white">{movesCount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={handleInitGame}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 text-sm font-black py-2.5 rounded-xl shadow-lg transition transform active:scale-95"
                  >
                    Jogar Novamente
                  </button>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border border-amber-600/50 text-xs font-bold py-2 rounded-xl transition transform active:scale-95"
                  >
                    Ver Tabuleiro
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. CONTROLES VIRTUAIS (D-PAD) */}
      <div className="w-full flex justify-center items-center min-h-[90px] mt-1">
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center gap-1"
            >
              <button
                onClick={() => handleAttemptMove('UP')}
                className="w-9 h-9 bg-amber-800/80 hover:bg-amber-700 active:scale-90 border border-amber-500/50 text-amber-100 rounded-xl font-black text-base flex items-center justify-center shadow-md transition"
              >
                ▲
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAttemptMove('LEFT')}
                  className="w-9 h-9 bg-amber-800/80 hover:bg-amber-700 active:scale-90 border border-amber-500/50 text-amber-100 rounded-xl font-black text-base flex items-center justify-center shadow-md transition"
                >
                  ◀
                </button>
                <button
                  onClick={() => handleAttemptMove('DOWN')}
                  className="w-9 h-9 bg-amber-800/80 hover:bg-amber-700 active:scale-90 border border-amber-500/50 text-amber-100 rounded-xl font-black text-base flex items-center justify-center shadow-md transition"
                >
                  ▼
                </button>
                <button
                  onClick={() => handleAttemptMove('RIGHT')}
                  className="w-9 h-9 bg-amber-800/80 hover:bg-amber-700 active:scale-90 border border-amber-500/50 text-amber-100 rounded-xl font-black text-base flex items-center justify-center shadow-md transition"
                >
                  ▶
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};