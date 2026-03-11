import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitGameScore } from '../store/slices/gamesSlice';

const MemoryMatchGame = ({ onGameComplete }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [gameState, setGameState] = useState({
    cards: [],
    flippedCards: [],
    matchedCards: [],
    moves: 0,
    score: 0,
    gameStarted: false,
    gameCompleted: false,
    timeLeft: 180, // 3 minutes
    startTime: null
  });

  // Environmental pairs for memory matching
  const cardPairs = [
    { id: 1, emoji: '🌱', name: 'Plant' },
    { id: 2, emoji: '🌳', name: 'Tree' },
    { id: 3, emoji: '♻️', name: 'Recycle' },
    { id: 4, emoji: '🌍', name: 'Earth' },
    { id: 5, emoji: '💧', name: 'Water' },
    { id: 6, emoji: '☀️', name: 'Sun' },
    { id: 7, emoji: '🐝', name: 'Bee' },
    { id: 8, emoji: '🦋', name: 'Butterfly' }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    // Create pairs of cards
    const pairs = [...cardPairs, ...cardPairs];
    // Shuffle cards
    const shuffled = pairs
      .map(card => ({ ...card, uniqueId: Math.random() }))
      .sort(() => Math.random() - 0.5);
    
    setGameState(prev => ({
      ...prev,
      cards: shuffled,
      flippedCards: [],
      matchedCards: [],
      moves: 0,
      score: 0,
      gameCompleted: false,
      timeLeft: 180,
      startTime: Date.now()
    }));
  }, []);

  // Start game
  const startGame = () => {
    initializeGame();
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      startTime: Date.now()
    }));
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState.gameStarted && !gameState.gameCompleted && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (gameState.timeLeft <= 0 && gameState.gameStarted) {
      endGame();
    }

    return () => clearInterval(interval);
  }, [gameState.gameStarted, gameState.gameCompleted, gameState.timeLeft]);

  // Check for matches
  useEffect(() => {
    if (gameState.flippedCards.length === 2) {
      const [first, second] = gameState.flippedCards;
      const firstCard = gameState.cards[first];
      const secondCard = gameState.cards[second];

      if (firstCard.id === secondCard.id) {
        // Match found
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            matchedCards: [...prev.matchedCards, first, second],
            flippedCards: [],
            score: prev.score + 100,
            moves: prev.moves + 1
          }));
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            flippedCards: [],
            moves: prev.moves + 1
          }));
        }, 1000);
      }
    }
  }, [gameState.flippedCards, gameState.cards]);

  // Check for game completion
  useEffect(() => {
    if (gameState.matchedCards.length === gameState.cards.length && gameState.cards.length > 0) {
      endGame();
    }
  }, [gameState.matchedCards, gameState.cards]);

  const endGame = async () => {
    const timeBonus = Math.max(0, gameState.timeLeft * 5);
    const finalScore = gameState.score + timeBonus;
    
    setGameState(prev => ({ 
      ...prev, 
      gameCompleted: true,
      score: finalScore
    }));
    
    if (isAuthenticated && finalScore > 0) {
      try {
        await dispatch(submitGameScore({
          gameId: 'memory-match-game',
          score: finalScore
        }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }

    if (onGameComplete) {
      onGameComplete(finalScore);
    }
  };

  const flipCard = (index) => {
    if (
      !gameState.gameStarted ||
      gameState.gameCompleted ||
      gameState.flippedCards.length >= 2 ||
      gameState.flippedCards.includes(index) ||
      gameState.matchedCards.includes(index)
    ) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      flippedCards: [...prev.flippedCards, index]
    }));
  };

  const isCardFlipped = (index) => {
    return gameState.flippedCards.includes(index) || gameState.matchedCards.includes(index);
  };

  const isCardMatched = (index) => {
    return gameState.matchedCards.includes(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState.gameStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-[var(--s1)] rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🧠 Eco Memory Match</h2>
          <p className="text-gray-600 mb-6">
            Match pairs of environmental cards to test your memory! 
            Find all pairs before time runs out to earn bonus points.
          </p>
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {cardPairs.slice(0, 4).map((card, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-1">{card.emoji}</div>
                  <div className="text-xs text-gray-600">{card.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6 text-sm text-gray-600">
            <p>• Click cards to flip them</p>
            <p>• Match pairs to score points</p>
            <p>• Finish quickly for time bonus!</p>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Stats */}
      <div className="bg-[var(--s1)] rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState.moves}</div>
              <div className="text-sm text-gray-600">Moves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(gameState.timeLeft)}
              </div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {gameState.matchedCards.length / 2} / {gameState.cards.length / 2}
              </div>
              <div className="text-sm text-gray-600">Pairs Found</div>
            </div>
          </div>
          
          {gameState.gameCompleted && (
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">Complete!</div>
              <div className="text-sm text-gray-600">Final Score: {gameState.score}</div>
            </div>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-[var(--s1)] rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {gameState.cards.map((card, index) => (
            <button
              key={card.uniqueId}
              onClick={() => flipCard(index)}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-300 text-4xl font-bold
                ${isCardFlipped(index) 
                  ? isCardMatched(index)
                    ? 'bg-green-100 border-green-300 text-green-600 cursor-default'
                    : 'bg-blue-100 border-blue-300 text-blue-600'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer'
                }
                ${gameState.flippedCards.includes(index) && !isCardMatched(index) 
                  ? 'animate-pulse' 
                  : ''
                }
              `}
              disabled={
                !gameState.gameStarted ||
                gameState.gameCompleted ||
                gameState.flippedCards.length >= 2 ||
                isCardFlipped(index)
              }
            >
              {isCardFlipped(index) ? card.emoji : '🌿'}
            </button>
          ))}
        </div>
        
        {gameState.gameCompleted && (
          <div className="text-center mt-6">
            <div className="bg-green-50 rounded-lg p-4 inline-block">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-green-700">
                You matched all pairs in {gameState.moves} moves!
              </p>
              {gameState.timeLeft > 0 && (
                <p className="text-green-600 text-sm">
                  Time bonus: +{gameState.timeLeft * 5} points
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-[var(--s1)] rounded-lg shadow-lg p-4 mt-6">
        <div className="text-center text-sm text-gray-600">
          <p>Click on cards to flip them and find matching pairs.</p>
          <p>Each pair represents something important for our environment!</p>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchGame;