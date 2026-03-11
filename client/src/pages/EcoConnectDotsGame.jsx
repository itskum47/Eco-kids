import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitGameScore } from '../store/slices/gamesSlice';

const EcoConnectDotsGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [gameState, setGameState] = useState({
    score: 0,
    gameStarted: false,
    gameCompleted: false,
    currentLevel: 1,
    connectedDots: [],
    targetPattern: []
  });

  const ecoPatterns = [
    {
      name: "Tree",
      dots: [
        { x: 2, y: 0, id: 1 }, { x: 1, y: 1, id: 2 }, { x: 3, y: 1, id: 3 },
        { x: 0, y: 2, id: 4 }, { x: 2, y: 2, id: 5 }, { x: 4, y: 2, id: 6 },
        { x: 2, y: 3, id: 7 }, { x: 2, y: 4, id: 8 }
      ],
      connections: [[1,2], [1,3], [2,4], [3,6], [4,5], [5,6], [5,7], [7,8]],
      emoji: "🌳"
    },
    {
      name: "Recycling Symbol",
      dots: [
        { x: 1, y: 0, id: 1 }, { x: 3, y: 0, id: 2 }, { x: 0, y: 1, id: 3 },
        { x: 2, y: 1, id: 4 }, { x: 4, y: 1, id: 5 }, { x: 1, y: 2, id: 6 },
        { x: 3, y: 2, id: 7 }, { x: 2, y: 3, id: 8 }
      ],
      connections: [[1,3], [3,6], [6,8], [8,7], [7,5], [5,2], [2,4], [4,1]],
      emoji: "♻️"
    }
  ];

  const startGame = () => {
    const pattern = ecoPatterns[0];
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      targetPattern: pattern,
      connectedDots: [],
      score: 0
    }));
  };

  const connectDot = (dotId) => {
    if (gameState.connectedDots.includes(dotId)) return;
    
    const newConnected = [...gameState.connectedDots, dotId];
    setGameState(prev => ({ ...prev, connectedDots: newConnected }));
    
    // Check if pattern is complete
    if (newConnected.length === gameState.targetPattern.dots.length) {
      setTimeout(() => {
        completeLevel();
      }, 500);
    }
  };

  const completeLevel = async () => {
    const newScore = gameState.score + (100 * gameState.currentLevel);
    setGameState(prev => ({ 
      ...prev, 
      score: newScore,
      gameCompleted: true 
    }));
    
    if (isAuthenticated && newScore > 0) {
      try {
        await dispatch(submitGameScore({
          gameId: 'eco-connect-dots-game',
          score: newScore
        }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }

    if (onGameComplete) {
      onGameComplete(newScore);
    }
  };

  if (!gameState.gameStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-[var(--s1)] rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🔗 Eco Connect Dots</h2>
          <p className="text-gray-600 mb-6">
            Connect the dots to form eco-friendly patterns and symbols!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Start Connecting
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
          <div className="flex items-center space-x-4">
            <span className="text-lg">Level {gameState.currentLevel}</span>
            <span className="text-2xl">{gameState.targetPattern.emoji}</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--s1)] rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">
            Connect the dots to form: {gameState.targetPattern.name}
          </h3>
          <p className="text-gray-600">
            Click dots in order: {gameState.connectedDots.length}/{gameState.targetPattern.dots.length}
          </p>
        </div>
        
        <div className="relative bg-green-50 rounded-lg p-8 mx-auto" style={{ width: '400px', height: '400px' }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Draw connections between connected dots */}
            {gameState.connectedDots.map((dotId, index) => {
              if (index === 0) return null;
              const currentDot = gameState.targetPattern.dots.find(d => d.id === dotId);
              const previousDot = gameState.targetPattern.dots.find(d => d.id === gameState.connectedDots[index - 1]);
              
              return (
                <line
                  key={`${previousDot.id}-${currentDot.id}`}
                  x1={`${(previousDot.x / 4) * 100}%`}
                  y1={`${(previousDot.y / 4) * 100}%`}
                  x2={`${(currentDot.x / 4) * 100}%`}
                  y2={`${(currentDot.y / 4) * 100}%`}
                  stroke="green"
                  strokeWidth="3"
                />
              );
            })}
          </svg>
          
          {/* Render dots */}
          {gameState.targetPattern.dots.map((dot, index) => {
            const isConnected = gameState.connectedDots.includes(dot.id);
            const isNext = gameState.connectedDots.length === 0 ? dot.id === 1 : 
                          !isConnected && gameState.connectedDots.length < gameState.targetPattern.dots.length;
            
            return (
              <button
                key={dot.id}
                onClick={() => connectDot(dot.id)}
                disabled={isConnected}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                  isConnected 
                    ? 'bg-green-500' 
                    : isNext 
                      ? 'bg-blue-500 hover:bg-blue-600 animate-pulse' 
                      : 'bg-gray-400'
                }`}
                style={{
                  left: `${(dot.x / 4) * 100}%`,
                  top: `${(dot.y / 4) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {dot.id}
              </button>
            );
          })}
        </div>
      </div>

      {gameState.gameCompleted && (
        <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6 mt-6 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Pattern Complete!</h3>
          <div className="text-4xl mb-4">{gameState.targetPattern.emoji}</div>
          <p className="text-lg mb-4">
            You successfully created a {gameState.targetPattern.name}!
          </p>
          <p className="text-xl font-bold">Final Score: {gameState.score}</p>
        </div>
      )}
    </div>
  );
};

export default EcoConnectDotsGame;