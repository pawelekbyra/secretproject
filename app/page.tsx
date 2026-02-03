import dynamic from 'next/dynamic';

const GameScene = dynamic(() => import('./Game'), { ssr: false });

export default function Page() {
  return <GameScene />;
}
