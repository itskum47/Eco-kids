import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaTrophy, FaClock } from 'react-icons/fa';
import { addToast } from '../../store/slices/uiSlice';
import EcoMascot from '../components/common/EcoMascot';

const MemoryMatchGame = ({ gameData, onScoreSubmit }) => {
  const dispatch = useDispatch();
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    moves: 0,
    matches: 0,
    timeLeft: 120, // 2 minutes
    gameOver: false,
    won: false
  });

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [mascotMessage, setMascotMessage] = useState("Ready to play memory match?");
  const [mascotEmotion, setMascotEmotion] = useState("happy");

  // Environmental card pairs
  const cardPairs = [
    { id: 1, name: 'Solar Panel', icon: '☀️', category: 'Renewable Energy' },
    { id: 2, name: 'Wind Turbine', icon: '🌪️', category: 'Renewable Energy' },
    { id: 3, name: 'Recycling', icon: '♻️', category: 'Waste Management' },
    { id: 4, name: 'Tree', icon: '🌳', category: 'Forest Conservation' },
    { id: 5, name: 'Water Drop', icon: '💧', category: 'Water Conservation' },
    { id: 6, name: 'Leaf', icon: '🍃', category: 'Biodiversity' },
    { id: 7, name: 'Earth', icon: '🌍', category: 'Climate Change' },
    { id: 8, name: 'Flower', icon: '🌸', category: 'Biodiversity' },
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameCards = [...cardPairs, ...cardPairs].map((card, index) => ({
      ...card,
      uniqueId: index,
      isFlipped: false,
      isMatched: false
    }));
    
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedCards([]);
  }, []);

  // Start game
  const startGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      moves: 0,
      matches: 0,
      timeLeft: 120,
      gameOver: false,
      won: false
    });
    setMascotMessage("Find the matching pairs!");
    setMascotEmotion("encouraging");
    initializeGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      isPlaying: false,
      score: 0,
      moves: 0,
      matches: 0,
      timeLeft: 120,
      gameOver: false,
      won: false
    });
    setMascotMessage("Ready for another round?");
    setMascotEmotion("happy");
    initializeGame();
  };

  // Timer
  useEffect(() => {
    let timer;
    if (gameState.isPlaying && gameState.timeLeft > 0 && !gameState.won) {
      timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            setMascotMessage("Time's up! Let's try again!");
            setMascotEmotion("encouraging");
            dispatch(addToast({
              type: 'error',
              message: 'Time\'s up! Game Over.'
            }));
            onScoreSubmit?.(prev.score, 120 - newTimeLeft, false);
            return {
              ...prev,
              timeLeft: 0,
              gameOver: true,
              isPlaying: false
            };
          }
          
          // Update mascot message based on time remaining
          if (newTimeLeft === 30) {
            setMascotMessage("Hurry up! 30 seconds left!");
            setMascotEmotion("encouraging");
          } else if (newTimeLeft === 10) {
            setMascotMessage("Almost out of time!");
            setMascotEmotion("encouraging");
          }
          
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.timeLeft, gameState.won, dispatch, onScoreSubmit]);

  // Handle card click
  const handleCardClick = (cardIndex) => {
    if (!gameState.isPlaying || gameState.gameOver) return;
    
    const card = cards[cardIndex];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardIndex];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map((c, i) => 
      i === cardIndex ? { ...c, isFlipped: true } : c
    ));

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setGameState(prev => ({ ...prev, moves: prev.moves + 1 }));
      
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      setTimeout(() => {
        if (firstCard.id === secondCard.id) {
          // Match found
          setMatchedCards(prev => [...prev, firstIndex, secondIndex]);
          setCards(prev => prev.map((c, i) => 
            (i === firstIndex || i === secondIndex) 
              ? { ...c, isMatched: true }
              : c
          ));
          
          const points = Math.max(10, 20 - Math.floor(gameState.moves / 2));
          setGameState(prev => ({
            ...prev,
            score: prev.score + points,
            matches: prev.matches + 1
          }));

          // Mascot celebrates the match
          const matchMessages = [
            "Great match! 🎉",
            "Well done! Keep going!",
            "Perfect! You're doing amazing!",
            "Excellent memory skills!",
            "Way to go, eco champion!"
          ];
          setMascotMessage(matchMessages[Math.floor(Math.random() * matchMessages.length)]);
          setMascotEmotion("excited");

          dispatch(addToast({
            type: 'success',
            message: `Match found! +${points} points`
          }));

          // Check win condition
          if (gameState.matches + 1 === cardPairs.length) {
            const timeBonus = gameState.timeLeft * 2;
            const finalScore = gameState.score + points + timeBonus;
            
            setGameState(prev => ({
              ...prev,
              won: true,
              isPlaying: false,
              score: finalScore
            }));

            setMascotMessage("Amazing job! You're an eco hero! 🌟");
            setMascotEmotion("excited");

            dispatch(addToast({
              type: 'success',
              message: `Congratulations! All pairs matched! Final score: ${finalScore}`
            }));

            onScoreSubmit?.(finalScore, 120 - gameState.timeLeft, true);
          } else {
            // Return to encouraging message after celebration
            setTimeout(() => {
              setMascotMessage("Keep finding those pairs!");
              setMascotEmotion("encouraging");
            }, 2000);
          }
        } else {
          // No match - flip cards back
          setCards(prev => prev.map((c, i) => 
            (i === firstIndex || i === secondIndex) 
              ? { ...c, isFlipped: false }
              : c
          ));
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
      {/* Game header with mascot */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow">
          <div className="flex-shrink-0">
            <EcoMascot 
              message={mascotMessage}
              emotion={mascotEmotion}
              size="medium"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-gray-800">🧠 Eco Memory Match</h3>
            <p className="text-sm text-gray-600">Match environmental pairs with our eco friend!</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm justify-center lg:justify-end">
          <span className="badge badge-primary">Score: {gameState.score}</span>
          <span className="badge badge-secondary">Moves: {gameState.moves}</span>
          <span className="badge badge-warning">
            <FaClock className="mr-1" />
            {formatTime(gameState.timeLeft)}
          </span>
        </div>
      </div>

      {gameState.won && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-4 p-4 bg-success-50 rounded-lg border border-success-200"
        >
          <div className="flex items-center justify-center text-success-600 mb-2">
            <FaTrophy className="mr-2 text-2xl" />
            <span className="text-xl font-bold">Perfect Memory!</span>
          </div>
          <p className="text-success-700">
            All pairs matched in {gameState.moves} moves!
          </p>
        </motion.div>
      )}

      <div className="game-board">
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.uniqueId}
                layout
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ 
                  scale: 1, 
                  rotateY: card.isFlipped || card.isMatched ? 0 : 180 
                }}
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  aspect-square bg-gradient-to-br rounded-xl cursor-pointer
                  flex items-center justify-center text-3xl font-bold
                  transition-all duration-300 shadow-md
                  ${card.isMatched 
                    ? 'from-success-400 to-success-600 text-white' 
                    : card.isFlipped 
                      ? 'from-primary-400 to-primary-600 text-white'
                      : 'from-gray-300 to-gray-500 text-gray-600 hover:from-gray-400 hover:to-gray-600'
                  }
                `}
                onClick={() => handleCardClick(index)}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="flex flex-col items-center">
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-2xl mb-1">{card.icon}</span>
                      <span className="text-xs text-center leading-tight">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <span>🌿</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="game-controls mt-6 text-center">
        {!gameState.isPlaying && !gameState.gameOver && !gameState.won && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="btn btn-primary"
          >
            <FaPlay className="mr-2" />
            Start Game
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className={`btn btn-outline ${gameState.isPlaying ? 'ml-4' : 'ml-2'}`}
        >
          <FaRedo className="mr-2" />
          New Game
        </motion.button>
      </div>

      <div className="instructions mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click cards to flip them over</li>
          <li>• Find matching pairs of environmental items</li>
          <li>• Complete all pairs before time runs out</li>
          <li>• Fewer moves = higher score</li>
          <li>• Time bonus for quick completion</li>
        </ul>
      </div>

      <div className="environmental-info mt-4 p-4 bg-secondary-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-secondary-800">🌱 Learn About:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-secondary-700">
          <div>• Renewable Energy</div>
          <div>• Water Conservation</div>
          <div>• Waste Management</div>
          <div>• Forest Conservation</div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchGame;
