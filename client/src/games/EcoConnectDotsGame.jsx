import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaTrophy, FaPencilAlt, FaCheck } from 'react-icons/fa';
import { addToast } from '../../store/slices/uiSlice';

const EcoConnectDotsGame = ({ gameData, onScoreSubmit }) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    timeLeft: 120,
    level: 1,
    gameOver: false,
    won: false,
    currentPuzzle: 0
  });

  const [drawing, setDrawing] = useState({
    isDrawing: false,
    currentPath: [],
    completedPaths: [],
    currentDot: null,
    nextDot: null
  });

  // Eco-themed connect-the-dots puzzles
  const puzzles = [
    {
      id: 1,
      name: 'Solar Panel',
      theme: 'Renewable Energy',
      points: 50,
      dots: [
        { id: 1, x: 150, y: 100, order: 1 },
        { id: 2, x: 350, y: 100, order: 2 },
        { id: 3, x: 450, y: 150, order: 3 },
        { id: 4, x: 450, y: 250, order: 4 },
        { id: 5, x: 350, y: 300, order: 5 },
        { id: 6, x: 150, y: 300, order: 6 },
        { id: 7, x: 50, y: 250, order: 7 },
        { id: 8, x: 50, y: 150, order: 8 },
        { id: 9, x: 150, y: 100, order: 9 }
      ],
      message: 'Solar panels convert sunlight into clean electricity!'
    },
    {
      id: 2,
      name: 'Wind Turbine',
      theme: 'Clean Energy',
      points: 75,
      dots: [
        { id: 1, x: 250, y: 300, order: 1 },
        { id: 2, x: 250, y: 200, order: 2 },
        { id: 3, x: 250, y: 100, order: 3 },
        { id: 4, x: 200, y: 80, order: 4 },
        { id: 5, x: 150, y: 100, order: 5 },
        { id: 6, x: 250, y: 100, order: 6 },
        { id: 7, x: 300, y: 50, order: 7 },
        { id: 8, x: 350, y: 80, order: 8 },
        { id: 9, x: 250, y: 100, order: 9 },
        { id: 10, x: 280, y: 120, order: 10 },
        { id: 11, x: 320, y: 150, order: 11 }
      ],
      message: 'Wind turbines generate power from moving air!'
    },
    {
      id: 3,
      name: 'Tree and Ecosystem',
      theme: 'Nature Conservation',
      points: 100,
      dots: [
        { id: 1, x: 200, y: 300, order: 1 }, // trunk base
        { id: 2, x: 200, y: 250, order: 2 }, // trunk middle
        { id: 3, x: 200, y: 200, order: 3 }, // trunk top
        { id: 4, x: 150, y: 180, order: 4 }, // left branch
        { id: 5, x: 100, y: 160, order: 5 }, // left leaves
        { id: 6, x: 120, y: 140, order: 6 },
        { id: 7, x: 150, y: 130, order: 7 },
        { id: 8, x: 180, y: 140, order: 8 },
        { id: 9, x: 200, y: 150, order: 9 }, // back to center
        { id: 10, x: 250, y: 160, order: 10 }, // right branch
        { id: 11, x: 300, y: 140, order: 11 }, // right leaves
        { id: 12, x: 320, y: 160, order: 12 },
        { id: 13, x: 300, y: 180, order: 13 },
        { id: 14, x: 270, y: 170, order: 14 },
        { id: 15, x: 200, y: 180, order: 15 } // back to trunk
      ],
      message: 'Trees provide oxygen, absorb CO2, and support wildlife!'
    },
    {
      id: 4,
      name: 'Recycling Symbol',
      theme: 'Waste Management',
      points: 60,
      dots: [
        { id: 1, x: 200, y: 150, order: 1 },
        { id: 2, x: 170, y: 200, order: 2 },
        { id: 3, x: 150, y: 250, order: 3 },
        { id: 4, x: 180, y: 280, order: 4 },
        { id: 5, x: 220, y: 280, order: 5 },
        { id: 6, x: 250, y: 250, order: 6 },
        { id: 7, x: 280, y: 200, order: 7 },
        { id: 8, x: 300, y: 150, order: 8 },
        { id: 9, x: 270, y: 120, order: 9 },
        { id: 10, x: 230, y: 120, order: 10 },
        { id: 11, x: 200, y: 150, order: 11 }
      ],
      message: 'Recycling reduces waste and conserves natural resources!'
    },
    {
      id: 5,
      name: 'Electric Car',
      theme: 'Sustainable Transport',
      points: 85,
      dots: [
        { id: 1, x: 100, y: 200, order: 1 }, // front
        { id: 2, x: 150, y: 180, order: 2 }, // hood
        { id: 3, x: 200, y: 170, order: 3 }, // roof front
        { id: 4, x: 280, y: 170, order: 4 }, // roof back
        { id: 5, x: 320, y: 180, order: 5 }, // trunk
        { id: 6, x: 350, y: 200, order: 6 }, // back
        { id: 7, x: 350, y: 230, order: 7 }, // back bottom
        { id: 8, x: 320, y: 250, order: 8 }, // wheel area
        { id: 9, x: 280, y: 250, order: 9 }, // between wheels
        { id: 10, x: 220, y: 250, order: 10 }, // middle
        { id: 11, x: 160, y: 250, order: 11 }, // wheel area
        { id: 12, x: 120, y: 250, order: 12 }, // front wheel area
        { id: 13, x: 100, y: 230, order: 13 }, // front bottom
        { id: 14, x: 100, y: 200, order: 14 } // back to start
      ],
      message: 'Electric cars produce zero emissions and run on clean energy!'
    }
  ];

  // Initialize game
  const initializeGame = () => {
    setDrawing({
      isDrawing: false,
      currentPath: [],
      completedPaths: [],
      currentDot: null,
      nextDot: null
    });
  };

  // Start game
  const startGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      timeLeft: 120,
      level: 1,
      gameOver: false,
      won: false,
      currentPuzzle: 0
    });
    initializeGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      isPlaying: false,
      score: 0,
      timeLeft: 120,
      level: 1,
      gameOver: false,
      won: false,
      currentPuzzle: 0
    });
    initializeGame();
  };

  // Timer
  useEffect(() => {
    let timer;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            dispatch(addToast({
              type: 'info',
              message: `Time's up! Completed ${prev.currentPuzzle} puzzles`
            }));
            onScoreSubmit?.(prev.score, 120 - newTimeLeft, prev.currentPuzzle >= 3);
            return {
              ...prev,
              timeLeft: 0,
              gameOver: true,
              isPlaying: false
            };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.timeLeft, dispatch, onScoreSubmit]);

  // Canvas mouse events
  const getCanvasPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findNearestDot = (pos) => {
    const currentPuzzleData = puzzles[gameState.currentPuzzle];
    if (!currentPuzzleData) return null;

    const SNAP_DISTANCE = 25;
    return currentPuzzleData.dots.find(dot => {
      const distance = Math.sqrt(
        Math.pow(pos.x - dot.x, 2) + Math.pow(pos.y - dot.y, 2)
      );
      return distance <= SNAP_DISTANCE;
    });
  };

  const handleMouseDown = (e) => {
    if (!gameState.isPlaying) return;
    
    const pos = getCanvasPosition(e);
    const nearestDot = findNearestDot(pos);
    
    if (nearestDot) {
      const expectedOrder = drawing.completedPaths.length + 1;
      
      if (nearestDot.order === expectedOrder) {
        setDrawing(prev => ({
          ...prev,
          isDrawing: true,
          currentDot: nearestDot,
          nextDot: puzzles[gameState.currentPuzzle].dots.find(dot => dot.order === expectedOrder + 1),
          currentPath: [{ x: nearestDot.x, y: nearestDot.y }]
        }));
      } else {
        dispatch(addToast({
          type: 'warning',
          message: `Connect dots in order! Next dot: ${expectedOrder}`
        }));
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing.isDrawing || !gameState.isPlaying) return;
    
    const pos = getCanvasPosition(e);
    setDrawing(prev => ({
      ...prev,
      currentPath: [...prev.currentPath, pos]
    }));
  };

  const handleMouseUp = (e) => {
    if (!drawing.isDrawing || !gameState.isPlaying) return;
    
    const pos = getCanvasPosition(e);
    const nearestDot = findNearestDot(pos);
    
    if (nearestDot && nearestDot.id === drawing.nextDot?.id) {
      // Successful connection
      const newPath = [...drawing.currentPath, { x: nearestDot.x, y: nearestDot.y }];
      const newCompletedPaths = [...drawing.completedPaths, newPath];
      
      setDrawing({
        isDrawing: false,
        currentPath: [],
        completedPaths: newCompletedPaths,
        currentDot: null,
        nextDot: null
      });

      // Check if puzzle is complete
      const currentPuzzleData = puzzles[gameState.currentPuzzle];
      if (newCompletedPaths.length === currentPuzzleData.dots.length - 1) {
        // Puzzle completed
        const points = currentPuzzleData.points;
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          currentPuzzle: prev.currentPuzzle + 1
        }));

        dispatch(addToast({
          type: 'success',
          message: `${currentPuzzleData.name} completed! +${points} points`
        }));

        // Check if all puzzles completed
        if (gameState.currentPuzzle + 1 >= puzzles.length) {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              won: true,
              gameOver: true,
              isPlaying: false
            }));
            
            dispatch(addToast({
              type: 'success',
              message: 'All puzzles completed! You\'re an eco champion!'
            }));
          }, 1000);
        } else {
          // Move to next puzzle
          setTimeout(() => {
            setDrawing({
              isDrawing: false,
              currentPath: [],
              completedPaths: [],
              currentDot: null,
              nextDot: null
            });
          }, 1500);
        }
      }
    } else {
      // Failed connection
      setDrawing(prev => ({
        ...prev,
        isDrawing: false,
        currentPath: []
      }));
      
      dispatch(addToast({
        type: 'error',
        message: 'Connect to the next dot in sequence!'
      }));
    }
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentPuzzleData = puzzles[gameState.currentPuzzle];

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!currentPuzzleData) return;

    // Draw completed paths
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    drawing.completedPaths.forEach(path => {
      if (path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }
    });

    // Draw current path
    if (drawing.currentPath.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(drawing.currentPath[0].x, drawing.currentPath[0].y);
      for (let i = 1; i < drawing.currentPath.length; i++) {
        ctx.lineTo(drawing.currentPath[i].x, drawing.currentPath[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw dots
    currentPuzzleData.dots.forEach((dot, index) => {
      const isCompleted = index < drawing.completedPaths.length;
      const isNext = dot.order === drawing.completedPaths.length + 1;
      const isActive = drawing.currentDot?.id === dot.id;

      // Dot circle
      ctx.fillStyle = isCompleted ? '#10b981' : isNext ? '#f59e0b' : isActive ? '#3b82f6' : '#6b7280';
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, isNext || isActive ? 12 : 8, 0, 2 * Math.PI);
      ctx.fill();

      // Dot number
      ctx.fillStyle = 'var(--t1)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dot.order.toString(), dot.x, dot.y);

      // Next dot indicator
      if (isNext) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 18, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

  }, [drawing, gameState.currentPuzzle]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPuzzleData = puzzles[gameState.currentPuzzle];

  return (
    <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🔗 Eco Connect-the-Dots</h3>
        <div className="flex gap-4 text-sm">
          <span className="badge badge-primary">Score: {gameState.score}</span>
          <span className="badge badge-secondary">Puzzle: {gameState.currentPuzzle + 1}/{puzzles.length}</span>
          <span className="badge badge-warning">Time: {formatTime(gameState.timeLeft)}</span>
        </div>
      </div>

      {/* Current Puzzle Info */}
      {currentPuzzleData && (
        <div className="puzzle-info text-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-1">
            {currentPuzzleData.name}
          </h4>
          <p className="text-sm text-gray-600">
            Theme: {currentPuzzleData.theme} • Points: {currentPuzzleData.points}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Progress: {drawing.completedPaths.length}/{currentPuzzleData.dots.length - 1} connections
          </p>
        </div>
      )}

      {/* Game Canvas */}
      <div className="game-area mb-4 flex justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          className="border-2 border-gray-300 rounded-lg cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* Puzzle Message */}
      {currentPuzzleData && (
        <div className="puzzle-message mb-4 p-3 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            <FaCheck className="inline mr-1" />
            {currentPuzzleData.message}
          </p>
        </div>
      )}

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
            Start Drawing
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
              <span className="font-bold">
                {gameState.won ? 'All Puzzles Complete!' : 'Game Over!'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Completed {gameState.currentPuzzle} puzzles with {gameState.score} points
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click and drag to connect dots in numerical order</li>
          <li>• Start from dot 1 and connect to dot 2, then 2 to 3, etc.</li>
          <li>• Complete the drawing to reveal eco-friendly objects</li>
          <li>• Learn about renewable energy and environmental protection</li>
          <li>• Complete all puzzles to become an eco champion!</li>
        </ul>
      </div>

      {/* Environmental Learning */}
      <div className="environmental-learning mt-4 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-green-800">🌱 Environmental Learning:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
          <div>• Solar panels: Clean renewable energy</div>
          <div>• Wind turbines: Harness wind power</div>
          <div>• Trees: Natural air purifiers</div>
          <div>• Recycling: Reduce waste and save resources</div>
          <div>• Electric cars: Zero emission transport</div>
          <div>• Every eco-choice makes a difference!</div>
        </div>
      </div>
    </div>
  );
};

export default EcoConnectDotsGame;