import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGameById } from '../store/slices/gamesSlice';
import Skeleton from '../components/common/Skeleton';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentGame, loading, error } = useSelector(state => state.games);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGameById(id));
    }
  }, [dispatch, id]);

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Game</h2>
          <button
            onClick={() => navigate('/games')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleGameComplete = (score) => {
    setGameStarted(false);
    // Handle game completion logic here
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10 pt-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton height="300px" className="rounded-3xl" />
        <Skeleton height="40px" width="60%" className="rounded-xl" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Game</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/games')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Not Found</h2>
          <button
            onClick={() => navigate('/games')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    // Render the actual game component based on game type
    const GameComponent = currentGame.gameComponent;
    if (GameComponent) {
      return <GameComponent onGameComplete={handleGameComplete} />;
    }

    // Fallback if no specific game component is defined
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Loading...</h2>
          <p className="text-gray-600 mb-6">The game component is being loaded.</p>
          <button
            onClick={() => setGameStarted(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/games')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Games
            </button>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${currentGame.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentGame.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {currentGame.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {currentGame.category}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentGame.title}</h1>

          {currentGame.description && (
            <p className="text-gray-600 text-lg mb-6">{currentGame.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {currentGame.estimatedTime && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentGame.estimatedTime} min
              </div>
            )}
            {currentGame.maxScore && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Max Score: {currentGame.maxScore}
              </div>
            )}
          </div>
        </div>

        {/* Game Preview/Screenshot */}
        {currentGame.imageUrl && (
          <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mb-8">
            <img
              src={currentGame.imageUrl}
              alt={currentGame.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Game Instructions */}
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Play</h3>
          <div className="prose prose-lg max-w-none">
            {currentGame.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: currentGame.instructions }} />
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Welcome to {currentGame.title}!</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Follow the on-screen instructions to play</li>
                  <li>Complete objectives to earn points</li>
                  <li>Try to achieve the highest score possible</li>
                  <li>Have fun while learning about environmental conservation!</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Learning Objectives */}
        {currentGame.learningObjectives && currentGame.learningObjectives.length > 0 && (
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What You'll Learn</h3>
            <ul className="space-y-2">
              {currentGame.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Game Section */}
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Ready to Start Playing?
          </h3>
          {!isAuthenticated ? (
            <div>
              <p className="text-gray-600 mb-6">
                Sign in to save your progress and compete on the leaderboard!
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Play as Guest
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Sign In to Play
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Good luck, {user?.name}! Your progress will be saved automatically.
              </p>
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* High Scores */}
        {currentGame.topScores && currentGame.topScores.length > 0 && (
          <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Scores</h3>
            <div className="space-y-2">
              {currentGame.topScores.slice(0, 5).map((score, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium">{score.playerName}</span>
                  </div>
                  <span className="font-bold text-green-600">{score.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;