import { Board } from '@/components/Board';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-900 to-amber-950 text-white">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide drop-shadow-md">Bottle Merge Game</h1>
      <Board />
    </main>
  );
}