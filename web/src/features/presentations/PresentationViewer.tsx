import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import GameOverviewDeck from './GameOverviewDeck';

export default function PresentationViewer() {
  const { id } = useParams<{ id: string }>();

  if (id !== 'game-overview') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Presentation not found: {id}</p>
        <Link to="/presentations" className="text-blue-400 hover:text-blue-300">
          &larr; Back to Presentations
        </Link>
      </div>
    );
  }

  return <GameOverviewDeck />;
}
