import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitGameScore } from '../store/slices/gamesSlice';

const WasteSortingGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [gameState, setGameState] = useState({
    score: 0,
    timeLeft: 120,
    gameStarted: false,
    gameCompleted: false,
    currentItem: null,
    sortedCorrectly: 0,
    totalItems: 20
  });

  const wasteItems = [
    { name: 'Plastic Bottle', type: 'recyclable', emoji: '🍶' },
    { name: 'Banana Peel', type: 'organic', emoji: '🍌' },
    { name: 'Newspaper', type: 'recyclable', emoji: '📰' },
    { name: 'Battery', type: 'hazardous', emoji: '🔋' },
    { name: 'Apple Core', type: 'organic', emoji: '🍎' },
    { name: 'Glass Jar', type: 'recyclable', emoji: '🫙' },
    { name: 'Old Phone', type: 'electronic', emoji: '📱' },
    { name: 'Food Scraps', type: 'organic', emoji: '🥬' }
  ];

  const bins = [
    { type: 'recyclable', color: 'blue', emoji: '♻️', name: 'Recyclable' },
    { type: 'organic', color: 'green', emoji: '🌱', name: 'Organic' },
    { type: 'hazardous', color: 'red', emoji: '☢️', name: 'Hazardous' },
    { type: 'electronic', color: 'purple', emoji: '💻', name: 'Electronic' }
  ];

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      currentItem: wasteItems[Math.floor(Math.random() * wasteItems.length)]
    }));
  };

  const sortItem = (binType) => {
    if (!gameState.currentItem) return;
    
    const correct = gameState.currentItem.type === binType;
    const points = correct ? 10 : -5;
    
    setGameState(prev => {
      const newScore = Math.max(0, prev.score + points);
      const newSorted = correct ? prev.sortedCorrectly + 1 : prev.sortedCorrectly;
      
      return {
        ...prev,
        score: newScore,
        sortedCorrectly: newSorted,
        currentItem: newSorted < prev.totalItems ? 
          wasteItems[Math.floor(Math.random() * wasteItems.length)] : null
      };
    });
    
    if (gameState.sortedCorrectly + 1 >= gameState.totalItems) {
      endGame();
    }
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, gameCompleted: true }));
    
    if (isAuthenticated && gameState.score > 0) {
      try {
        await dispatch(submitGameScore({
          gameId: 'waste-sorting-game',
          score: gameState.score
        }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }

    if (onGameComplete) {
      onGameComplete(gameState.score);
    }
  };

  if (!gameState.gameStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-[var(--s1)] rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🗂️ Waste Sorting Challenge</h2>
          <p className="text-gray-600 mb-6">
            Sort different waste items into the correct bins to protect our environment!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Start Sorting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-green-600">Score: {gameState.score}</div>
          <div className="text-lg">
            Progress: {gameState.sortedCorrectly}/{gameState.totalItems}
          </div>
        </div>
      </div>

      {gameState.currentItem && (
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-8 mb-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Sort this item:</h3>
          <div className="text-6xl mb-4">{gameState.currentItem.emoji}</div>
          <div className="text-xl font-semibold">{gameState.currentItem.name}</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bins.map((bin) => (
          <button
            key={bin.type}
            onClick={() => sortItem(bin.type)}
            className={`p-6 rounded-lg shadow-lg text-white font-semibold hover:opacity-80 transition-opacity ${
              bin.color === 'blue' ? 'bg-blue-500' :
              bin.color === 'green' ? 'bg-green-500' :
              bin.color === 'red' ? 'bg-red-500' :
              'bg-purple-500'
            }`}
          >
            <div className="text-4xl mb-2">{bin.emoji}</div>
            <div>{bin.name}</div>
          </button>
        ))}
      </div>

      {gameState.gameCompleted && (
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mt-6 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Game Complete!</h3>
          <p className="text-lg mb-4">
            You sorted {gameState.sortedCorrectly} items correctly!
          </p>
          <p className="text-xl font-bold">Final Score: {gameState.score}</p>
        </div>
      )}
    </div>
  );
};

export default WasteSortingGame;