import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaTrophy } from 'react-icons/fa';
import { addToast } from '../../store/slices/uiSlice';

const EcoMazeGame = ({ gameData, onScoreSubmit }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dispatch = useDispatch();
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    time: 0,
    gameOver: false,
    won: false
  });

  const [player, setPlayer] = useState({
    x: 40,
    y: 40,
    size: 20,
    speed: 3,
    direction: 'right'
  });

  const [collectibles, setCollectibles] = useState([]);
  const [obstacles, setObstacles] = useState([]);

  // Maze layout (1 = wall, 0 = path, 2 = collectible, 3 = obstacle)
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,2,1],
    [1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1],
    [1,0,2,0,0,0,1,0,0,0,1,0,0,0,3,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  const CELL_SIZE = 30;

  // Initialize game objects
  useEffect(() => {
    const newCollectibles = [];
    const newObstacles = [];
    
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 2) {
          newCollectibles.push({
            id: `collectible-${x}-${y}`,
            x: x * CELL_SIZE + CELL_SIZE / 2,
            y: y * CELL_SIZE + CELL_SIZE / 2,
            size: 15,
            type: 'leaf',
            points: 10,
            collected: false
          });
        } else if (cell === 3) {
          newObstacles.push({
            id: `obstacle-${x}-${y}`,
            x: x * CELL_SIZE,
            y: y * CELL_SIZE,
            size: CELL_SIZE,
            type: 'pollution',
            damage: 1
          });
        }
      });
    });
    
    setCollectibles(newCollectibles);
    setObstacles(newObstacles);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) return;

    setGameState(prev => ({
      ...prev,
      time: prev.time + 1/60 // Assuming 60 FPS
    }));

    // Check win condition
    const allCollected = collectibles.every(c => c.collected);
    if (allCollected && !gameState.won) {
      setGameState(prev => ({
        ...prev,
        won: true,
        isPlaying: false
      }));
      
      const finalScore = gameState.score + Math.floor((300 - gameState.time) * 2); // Time bonus
      onScoreSubmit?.(finalScore, Math.floor(gameState.time), true);
      dispatch(addToast({
        type: 'success',
        message: `Maze completed! Final score: ${finalScore}`
      }));
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, collectibles, dispatch, onScoreSubmit]);

  // Start game loop
  useEffect(() => {
    if (gameState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      const newPlayer = { ...player };
      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (canMove(player.x, player.y - player.speed)) {
            newPlayer.y -= player.speed;
            newPlayer.direction = 'up';
            moved = true;
          }
          break;
        case 'ArrowDown':
        case 's':
          if (canMove(player.x, player.y + player.speed)) {
            newPlayer.y += player.speed;
            newPlayer.direction = 'down';
            moved = true;
          }
          break;
        case 'ArrowLeft':
        case 'a':
          if (canMove(player.x - player.speed, player.y)) {
            newPlayer.x -= player.speed;
            newPlayer.direction = 'left';
            moved = true;
          }
          break;
        case 'ArrowRight':
        case 'd':
          if (canMove(player.x + player.speed, player.y)) {
            newPlayer.x += player.speed;
            newPlayer.direction = 'right';
            moved = true;
          }
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }

      if (moved) {
        setPlayer(newPlayer);
        checkCollisions(newPlayer);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [player, gameState.isPlaying, gameState.isPaused]);

  const canMove = (x, y) => {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    // Check bounds
    if (gridX < 0 || gridX >= maze[0].length || gridY < 0 || gridY >= maze.length) {
      return false;
    }
    
    // Check if it's a wall
    return maze[gridY][gridX] !== 1;
  };

  const checkCollisions = (playerPos) => {
    // Check collectibles
    setCollectibles(prev => prev.map(collectible => {
      if (!collectible.collected) {
        const distance = Math.sqrt(
          Math.pow(playerPos.x - collectible.x, 2) + 
          Math.pow(playerPos.y - collectible.y, 2)
        );
        
        if (distance < (playerPos.size + collectible.size) / 2) {
          setGameState(prevState => ({
            ...prevState,
            score: prevState.score + collectible.points
          }));
          
          dispatch(addToast({
            type: 'success',
            message: `+${collectible.points} points!`
          }));
          
          return { ...collectible, collected: true };
        }
      }
      return collectible;
    }));

    // Check obstacles
    obstacles.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(playerPos.x - (obstacle.x + obstacle.size/2), 2) + 
        Math.pow(playerPos.y - (obstacle.y + obstacle.size/2), 2)
      );
      
      if (distance < (playerPos.size + obstacle.size) / 2) {
        setGameState(prev => {
          const newLives = prev.lives - obstacle.damage;
          if (newLives <= 0) {
            dispatch(addToast({
              type: 'error',
              message: 'Game Over! Try again.'
            }));
            onScoreSubmit?.(prev.score, Math.floor(prev.time), false);
            return {
              ...prev,
              lives: 0,
              gameOver: true,
              isPlaying: false
            };
          }
          return { ...prev, lives: newLives };
        });
        
        dispatch(addToast({
          type: 'warning',
          message: `Hit pollution! Lives: ${gameState.lives - 1}`
        }));
        
        // Reset player position
        setPlayer(prev => ({ ...prev, x: 40, y: 40 }));
      }
    });
  };

  const startGame = () => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      score: 0,
      lives: 3,
      level: 1,
      time: 0,
      gameOver: false,
      won: false
    });
    
    setPlayer({
      x: 40,
      y: 40,
      size: 20,
      speed: 3,
      direction: 'right'
    });
    
    // Reset collectibles
    setCollectibles(prev => prev.map(c => ({ ...c, collected: false })));
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      isPaused: false,
      score: 0,
      lives: 3,
      level: 1,
      time: 0,
      gameOver: false,
      won: false
    });
    
    setPlayer({
      x: 40,
      y: 40,
      size: 20,
      speed: 3,
      direction: 'right'
    });
    
    setCollectibles(prev => prev.map(c => ({ ...c, collected: false })));
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    ctx.fillStyle = '#8B4513';
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    });

    // Draw collectibles (leaves)
    collectibles.forEach(collectible => {
      if (!collectible.collected) {
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(collectible.x, collectible.y, collectible.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Leaf shape
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.ellipse(collectible.x, collectible.y, collectible.size / 3, collectible.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw obstacles (pollution)
    obstacles.forEach(obstacle => {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.size - 10, obstacle.size - 10);
      
      // Pollution cloud
      ctx.fillStyle = '#7F1D1D';
      ctx.beginPath();
      ctx.arc(obstacle.x + obstacle.size/2, obstacle.y + obstacle.size/2, obstacle.size/4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Player direction indicator
    ctx.fillStyle = '#1E40AF';
    const directionOffsets = {
      up: [0, -player.size/3],
      down: [0, player.size/3],
      left: [-player.size/3, 0],
      right: [player.size/3, 0]
    };
    const [dx, dy] = directionOffsets[player.direction];
    ctx.beginPath();
    ctx.arc(player.x + dx, player.y + dy, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [player, collectibles, obstacles, maze]);

  return (
    <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🌱 Eco Maze Runner</h3>
        <div className="flex gap-4 text-sm">
          <span className="badge badge-primary">Score: {gameState.score}</span>
          <span className="badge badge-error">Lives: {gameState.lives}</span>
          <span className="badge badge-secondary">Time: {Math.floor(gameState.time)}s</span>
        </div>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={480}
          height={330}
          className="game-canvas border-2 border-gray-300 rounded-lg mx-auto block"
        />
      </div>

      <div className="game-controls mt-4">
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

        {gameState.isPlaying && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePause}
            className="btn btn-secondary"
          >
            {gameState.isPaused ? <FaPlay className="mr-2" /> : <FaPause className="mr-2" />}
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="btn btn-outline ml-2"
        >
          <FaRedo className="mr-2" />
          Reset
        </motion.button>

        {gameState.won && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center ml-4 text-success-600"
          >
            <FaTrophy className="mr-2" />
            <span className="font-bold">Maze Completed!</span>
          </motion.div>
        )}
      </div>

      <div className="instructions mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use arrow keys or WASD to move</li>
          <li>• Collect green leaves to earn points</li>
          <li>• Avoid red pollution clouds</li>
          <li>• Collect all leaves to win!</li>
          <li>• Press spacebar to pause</li>
        </ul>
      </div>
    </div>
  );
};

export default EcoMazeGame;
