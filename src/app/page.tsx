import { Board } from '@/components/Board';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-gradient-to-b from-amber-900 to-amber-950 text-white overflow-hidden">
      <Board />
    </main>
  );
}