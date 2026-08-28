import { Board } from '@/components/Board';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-900 to-amber-950 text-white">
      <Board />
    </main>
  );
}