import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaTrophy, FaTrash, FaLeaf, FaRecycle } from 'react-icons/fa';
import { addToast } from '../../store/slices/uiSlice';

const WasteSortingGame = ({ gameData, onScoreSubmit }) => {
  const dispatch = useDispatch();

  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    timeLeft: 90,
    itemsProcessed: 0,
    correctSorts: 0,
    gameOver: false,
    won: false
  });

  const [currentItem, setCurrentItem] = useState(null);
  const [nextItems, setNextItems] = useState([]);
  const [bins, setBins] = useState({
    organic: { items: [], score: 0 },
    recyclable: { items: [], score: 0 },
    hazardous: { items: [], score: 0 },
    general: { items: [], score: 0 }
  });

  // Waste items with their correct categories
  const wasteItems = [
    // Organic waste
    { id: 1, name: 'Banana Peel', icon: '🍌', category: 'organic', points: 10 },
    { id: 2, name: 'Apple Core', icon: '🍎', category: 'organic', points: 10 },
    { id: 3, name: 'Vegetable Scraps', icon: '🥬', category: 'organic', points: 10 },
    { id: 4, name: 'Eggshells', icon: '🥚', category: 'organic', points: 10 },
    { id: 5, name: 'Coffee Grounds', icon: '☕', category: 'organic', points: 10 },

    // Recyclable waste
    { id: 6, name: 'Plastic Bottle', icon: '🍼', category: 'recyclable', points: 15 },
    { id: 7, name: 'Aluminum Can', icon: '🥤', category: 'recyclable', points: 15 },
    { id: 8, name: 'Glass Bottle', icon: '🍾', category: 'recyclable', points: 15 },
    { id: 9, name: 'Cardboard', icon: '📦', category: 'recyclable', points: 15 },
    { id: 10, name: 'Newspaper', icon: '📰', category: 'recyclable', points: 15 },

    // Hazardous waste
    { id: 11, name: 'Battery', icon: '🔋', category: 'hazardous', points: 20 },
    { id: 12, name: 'Paint Can', icon: '🎨', category: 'hazardous', points: 20 },
    { id: 13, name: 'Light Bulb', icon: '💡', category: 'hazardous', points: 20 },
    { id: 14, name: 'Mobile Phone', icon: '📱', category: 'hazardous', points: 20 },

    // General waste
    { id: 15, name: 'Tissue Paper', icon: '🧻', category: 'general', points: 5 },
    { id: 16, name: 'Broken Toy', icon: '🧸', category: 'general', points: 5 },
    { id: 17, name: 'Dust', icon: '🪣', category: 'general', points: 5 },
    { id: 18, name: 'Cigarette Butt', icon: '🚬', category: 'general', points: 5 },
  ];

  const binInfo = {
    organic: {
      name: 'Organic Waste',
      icon: <FaLeaf className="text-green-600" />,
      color: 'bg-green-100 border-green-300',
      description: 'Food scraps, yard waste'
    },
    recyclable: {
      name: 'Recyclable',
      icon: <FaRecycle className="text-blue-600" />,
      color: 'bg-blue-100 border-blue-300',
      description: 'Plastics, metals, glass, paper'
    },
    hazardous: {
      name: 'Hazardous Waste',
      icon: <FaTrash className="text-red-600" />,
      color: 'bg-red-100 border-red-300',
      description: 'Batteries, chemicals, electronics'
    },
    general: {
      name: 'General Waste',
      icon: <FaTrash className="text-gray-600" />,
      color: 'bg-gray-100 border-gray-300',
      description: 'Non-recyclable items'
    }
  };

  // Generate random item
  const generateRandomItem = () => {
    return wasteItems[Math.floor(Math.random() * wasteItems.length)];
  };

  // Initialize game
  const initializeGame = () => {
    const items = Array.from({ length: 3 }, generateRandomItem);
    setCurrentItem(items[0]);
    setNextItems(items.slice(1));
    setBins({
      organic: { items: [], score: 0 },
      recyclable: { items: [], score: 0 },
      hazardous: { items: [], score: 0 },
      general: { items: [], score: 0 }
    });
  };

  // Start game
  const startGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      timeLeft: 90,
      itemsProcessed: 0,
      correctSorts: 0,
      gameOver: false,
      won: false
    });
    initializeGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      isPlaying: false,
      score: 0,
      timeLeft: 90,
      itemsProcessed: 0,
      correctSorts: 0,
      gameOver: false,
      won: false
    });
    initializeGame();
  };

  // Timer
  useEffect(() => {
    if (!gameState.isPlaying || gameState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          const accuracy = prev.itemsProcessed > 0 ? (prev.correctSorts / prev.itemsProcessed) * 100 : 0;
          dispatch(addToast({
            type: 'info',
            message: `Time's up! Accuracy: ${accuracy.toFixed(1)}%`
          }));
          onScoreSubmit?.(prev.score, 90, accuracy > 80);
          return {
            ...prev,
            timeLeft: 0,
            gameOver: true,
            isPlaying: false
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, dispatch, onScoreSubmit]);

  // Handle item sorting
  const sortItem = (binType) => {
    if (!currentItem || !gameState.isPlaying) return;

    const isCorrect = currentItem.category === binType;
    const points = isCorrect ? currentItem.points : -5;

    // Update bins
    setBins(prev => ({
      ...prev,
      [binType]: {
        items: [...prev[binType].items, currentItem],
        score: prev[binType].score + (isCorrect ? 1 : 0)
      }
    }));

    // Update game state
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, prev.score + points),
      itemsProcessed: prev.itemsProcessed + 1,
      correctSorts: prev.correctSorts + (isCorrect ? 1 : 0)
    }));

    // Show feedback
    dispatch(addToast({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect
        ? `Correct! +${points} points`
        : `Wrong bin! -5 points`
    }));

    // Move to next item
    setTimeout(() => {
      const newItem = generateRandomItem();
      setCurrentItem(nextItems[0] || newItem);
      setNextItems(prev => [...prev.slice(1), newItem]);
    }, 500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = () => {
    return gameState.itemsProcessed > 0
      ? ((gameState.correctSorts / gameState.itemsProcessed) * 100).toFixed(1)
      : '0.0';
  };

  return (
    <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">♻️ Waste Sorting Challenge</h3>
        <div className="flex gap-4 text-sm">
          <span className="badge badge-primary">Score: {gameState.score}</span>
          <span className="badge badge-secondary">Accuracy: {getAccuracy()}%</span>
          <span className="badge badge-warning">Time: {formatTime(gameState.timeLeft)}</span>
        </div>
      </div>

      {/* Current Item */}
      <div className="current-item text-center mb-6">
        <h4 className="text-lg font-semibold mb-4">Sort this item:</h4>
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -180 }}
              className="inline-block bg-gradient-to-br from-yellow-400 to-orange-500 
                         text-white rounded-xl p-6 shadow-lg"
            >
              <div className="text-4xl mb-2">{currentItem.icon}</div>
              <div className="text-xl font-bold">{currentItem.name}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waste Bins */}
      <div className="bins-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(binInfo).map(([binType, info]) => (
            <motion.div
              key={binType}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sortItem(binType)}
              className={`
                ${info.color} rounded-xl p-4 cursor-pointer border-2 border-dashed
                transition-all duration-200 hover:shadow-md
                ${!gameState.isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{info.icon}</div>
                <div className="font-semibold text-sm mb-1">{info.name}</div>
                <div className="text-xs text-gray-600 mb-2">{info.description}</div>
                <div className="text-xs font-bold">
                  Items: {bins[binType].items.length}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Items Preview */}
      <div className="next-items mb-6">
        <h5 className="text-sm font-semibold text-gray-600 mb-2">Coming up:</h5>
        <div className="flex gap-2 justify-center">
          {nextItems.slice(0, 2).map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="bg-gray-100 rounded-lg p-2 text-center opacity-60"
            >
              <div className="text-lg">{item.icon}</div>
              <div className="text-xs">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls mb-4 text-center">
        {!gameState.isPlaying && !gameState.gameOver && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="btn btn-primary"
          >
            <FaPlay className="mr-2" />
            Start Sorting
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

        {gameState.gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-center text-gray-700 mb-2">
              <FaTrophy className="mr-2" />
              <span className="font-bold">Game Complete!</span>
            </div>
            <div className="text-sm text-gray-600">
              Processed {gameState.itemsProcessed} items with {getAccuracy()}% accuracy
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click the correct bin for each waste item</li>
          <li>• Organic: Food scraps, biodegradable items</li>
          <li>• Recyclable: Plastics, metals, glass, paper</li>
          <li>• Hazardous: Batteries, chemicals, electronics</li>
          <li>• General: Everything else</li>
        </ul>
      </div>

      {/* Environmental Impact */}
      <div className="environmental-impact mt-4 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-green-800">🌍 Environmental Impact:</h4>
        <div className="text-sm text-green-700 space-y-1">
          <div>• Proper waste sorting reduces landfill waste by up to 75%</div>
          <div>• Recycling saves energy and reduces pollution</div>
          <div>• Composting organic waste creates nutrient-rich soil</div>
          <div>• Proper disposal of hazardous waste protects groundwater</div>
        </div>
      </div>
    </div>
  );
};

export default WasteSortingGame;