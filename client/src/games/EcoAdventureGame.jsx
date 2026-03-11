import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaTrophy, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { addToast } from '../../store/slices/uiSlice';

const EcoAdventureGame = ({ gameData, onScoreSubmit }) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    timeLeft: 180,
    level: 1,
    lives: 3,
    gameOver: false,
    won: false,
    currentScene: 'forest'
  });

  const [player, setPlayer] = useState({
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocity: { x: 0, y: 0 },
    isJumping: false,
    facingRight: true,
    hasWateringCan: false,
    hasSeeds: false
  });

  const [collectibles, setCollectibles] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [particles, setParticles] = useState([]);

  // Game scenes configuration
  const scenes = {
    forest: {
      name: 'Endangered Forest',
      background: '#4ade80',
      obstacles: [
        { x: 200, y: 350, width: 40, height: 30, type: 'pollutedRiver' },
        { x: 400, y: 320, width: 50, height: 60, type: 'deadTree' },
        { x: 600, y: 340, width: 30, height: 40, type: 'trash' }
      ],
      collectibles: [
        { x: 150, y: 280, type: 'seeds', points: 15 },
        { x: 350, y: 290, type: 'wateringCan', points: 20 },
        { x: 550, y: 270, type: 'fertilizer', points: 25 }
      ],
      npcs: [
        { x: 700, y: 300, type: 'forestGuardian', message: 'Help me restore this forest!' }
      ]
    },
    river: {
      name: 'Polluted River',
      background: '#06b6d4',
      obstacles: [
        { x: 180, y: 340, width: 60, height: 40, type: 'pollutedWater' },
        { x: 350, y: 350, width: 40, height: 30, type: 'plasticWaste' },
        { x: 520, y: 330, width: 45, height: 50, type: 'chemicalBarrel' }
      ],
      collectibles: [
        { x: 120, y: 270, type: 'cleaningKit', points: 30 },
        { x: 320, y: 280, type: 'recyclingBin', points: 20 },
        { x: 480, y: 290, type: 'filterSystem', points: 35 }
      ],
      npcs: [
        { x: 650, y: 300, type: 'riverSpirit', message: 'Clean the water to save aquatic life!' }
      ]
    },
    city: {
      name: 'Green City Challenge',
      background: '#64748b',
      obstacles: [
        { x: 200, y: 350, width: 50, height: 30, type: 'airPollution' },
        { x: 380, y: 340, width: 40, height: 40, type: 'carbonEmission' },
        { x: 560, y: 330, width: 60, height: 50, type: 'noiseSource' }
      ],
      collectibles: [
        { x: 160, y: 270, type: 'solarPanel', points: 40 },
        { x: 340, y: 280, type: 'windTurbine', points: 35 },
        { x: 520, y: 290, type: 'electricCar', points: 45 }
      ],
      npcs: [
        { x: 720, y: 300, type: 'ecoEngineer', message: 'Build a sustainable future!' }
      ]
    }
  };

  // Initialize game elements
  const initializeGame = () => {
    const currentSceneData = scenes[gameState.currentScene];
    
    setCollectibles(currentSceneData.collectibles.map((item, index) => ({
      ...item,
      id: index,
      collected: false
    })));
    
    setObstacles(currentSceneData.obstacles);
    setNpcs(currentSceneData.npcs);
    
    // Initialize platforms
    setPlatforms([
      { x: 0, y: 380, width: 800, height: 20 }, // Ground
      { x: 250, y: 320, width: 100, height: 15 },
      { x: 450, y: 280, width: 120, height: 15 },
      { x: 650, y: 240, width: 100, height: 15 }
    ]);

    setPlayer(prev => ({
      ...prev,
      x: 50,
      y: 300,
      velocity: { x: 0, y: 0 },
      isJumping: false
    }));
  };

  // Start game
  const startGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      timeLeft: 180,
      level: 1,
      lives: 3,
      gameOver: false,
      won: false,
      currentScene: 'forest'
    });
    initializeGame();
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      isPlaying: false,
      score: 0,
      timeLeft: 180,
      level: 1,
      lives: 3,
      gameOver: false,
      won: false,
      currentScene: 'forest'
    });
    initializeGame();
  };

  // Game timer
  useEffect(() => {
    let timer;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            dispatch(addToast({
              type: 'info',
              message: `Adventure complete! Final score: ${prev.score}`
            }));
            onScoreSubmit?.(prev.score, 180 - newTimeLeft, prev.level >= 3);
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameState.isPlaying) return;

      switch (e.key) {
        case 'ArrowLeft':
          setPlayer(prev => ({
            ...prev,
            velocity: { ...prev.velocity, x: -5 },
            facingRight: false
          }));
          break;
        case 'ArrowRight':
          setPlayer(prev => ({
            ...prev,
            velocity: { ...prev.velocity, x: 5 },
            facingRight: true
          }));
          break;
        case 'ArrowUp':
        case ' ':
          setPlayer(prev => {
            if (!prev.isJumping) {
              return {
                ...prev,
                velocity: { ...prev.velocity, y: -12 },
                isJumping: true
              };
            }
            return prev;
          });
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (!gameState.isPlaying) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setPlayer(prev => ({
          ...prev,
          velocity: { ...prev.velocity, x: 0 }
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying]);

  // Game physics and collision detection
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      setPlayer(prev => {
        let newX = prev.x + prev.velocity.x;
        let newY = prev.y + prev.velocity.y;
        let newVelocityY = prev.velocity.y + 0.8; // gravity
        let isJumping = prev.isJumping;

        // Boundary checks
        newX = Math.max(0, Math.min(770, newX));

        // Platform collision
        let onPlatform = false;
        platforms.forEach(platform => {
          if (newX < platform.x + platform.width &&
              newX + prev.width > platform.x &&
              newY + prev.height >= platform.y &&
              newY + prev.height <= platform.y + platform.height + 10) {
            if (prev.velocity.y >= 0) {
              newY = platform.y - prev.height;
              newVelocityY = 0;
              isJumping = false;
              onPlatform = true;
            }
          }
        });

        // Collectible collision
        collectibles.forEach((collectible, index) => {
          if (!collectible.collected &&
              newX < collectible.x + 20 &&
              newX + prev.width > collectible.x &&
              newY < collectible.y + 20 &&
              newY + prev.height > collectible.y) {
            
            setCollectibles(prevCollectibles => 
              prevCollectibles.map((item, i) => 
                i === index ? { ...item, collected: true } : item
              )
            );

            setGameState(prevGame => ({
              ...prevGame,
              score: prevGame.score + collectible.points
            }));

            // Add particles effect
            setParticles(prevParticles => [
              ...prevParticles,
              ...Array.from({ length: 5 }, (_, i) => ({
                id: Date.now() + i,
                x: collectible.x + 10,
                y: collectible.y + 10,
                velocity: {
                  x: (Math.random() - 0.5) * 6,
                  y: Math.random() * -8
                },
                life: 30,
                color: '#10b981'
              }))
            ]);

            dispatch(addToast({
              type: 'success',
              message: `Collected ${collectible.type}! +${collectible.points} points`
            }));
          }
        });

        // Obstacle collision
        obstacles.forEach(obstacle => {
          if (newX < obstacle.x + obstacle.width &&
              newX + prev.width > obstacle.x &&
              newY < obstacle.y + obstacle.height &&
              newY + prev.height > obstacle.y) {
            
            setGameState(prevGame => {
              const newLives = prevGame.lives - 1;
              if (newLives <= 0) {
                dispatch(addToast({
                  type: 'error',
                  message: 'Game Over! No lives remaining.'
                }));
                return {
                  ...prevGame,
                  lives: 0,
                  gameOver: true,
                  isPlaying: false
                };
              } else {
                dispatch(addToast({
                  type: 'warning',
                  message: `Hit obstacle! Lives remaining: ${newLives}`
                }));
                return { ...prevGame, lives: newLives };
              }
            });

            // Reset player position
            newX = 50;
            newY = 300;
          }
        });

        return {
          ...prev,
          x: newX,
          y: newY,
          velocity: { ...prev.velocity, y: newVelocityY },
          isJumping
        };
      });

      // Update particles
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            velocity: {
              ...particle.velocity,
              y: particle.velocity.y + 0.3
            },
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0)
      );
    };

    const gameLoopId = setInterval(gameLoop, 16);
    return () => clearInterval(gameLoopId);
  }, [gameState.isPlaying, collectibles, obstacles, platforms, dispatch]);

  // Check level completion
  useEffect(() => {
    if (gameState.isPlaying) {
      const allCollected = collectibles.every(item => item.collected);
      if (allCollected && gameState.level < 3) {
        const nextScene = gameState.level === 1 ? 'river' : 'city';
        setGameState(prev => ({
          ...prev,
          level: prev.level + 1,
          currentScene: nextScene
        }));
        
        dispatch(addToast({
          type: 'success',
          message: `Level ${gameState.level} completed! Moving to ${scenes[nextScene].name}`
        }));
        
        setTimeout(() => {
          initializeGame();
        }, 1000);
      } else if (allCollected && gameState.level === 3) {
        setGameState(prev => ({
          ...prev,
          won: true,
          gameOver: true,
          isPlaying: false
        }));
        
        dispatch(addToast({
          type: 'success',
          message: 'Congratulations! You saved all three environments!'
        }));
      }
    }
  }, [collectibles, gameState.level, gameState.isPlaying, dispatch]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentSceneData = scenes[gameState.currentScene];

    // Clear canvas
    ctx.fillStyle = currentSceneData.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8b5cf6';
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw collectibles
    collectibles.forEach(collectible => {
      if (!collectible.collected) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(collectible.x, collectible.y, 20, 20);
        ctx.fillStyle = 'var(--t1)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(collectible.type[0].toUpperCase(), collectible.x + 10, collectible.y + 15);
      }
    });

    // Draw obstacles
    ctx.fillStyle = '#ef4444';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw NPCs
    ctx.fillStyle = '#3b82f6';
    npcs.forEach(npc => {
      ctx.fillRect(npc.x, npc.y, 25, 35);
      ctx.fillStyle = 'var(--t1)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NPC', npc.x + 12, npc.y + 20);
      ctx.fillStyle = '#3b82f6';
    });

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 3, 3);
    });

    // Draw player
    ctx.fillStyle = player.facingRight ? '#f59e0b' : '#d97706';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player face
    ctx.fillStyle = 'var(--t1)';
    ctx.fillRect(player.x + 8, player.y + 8, 4, 4);
    ctx.fillRect(player.x + 18, player.y + 8, 4, 4);
    ctx.fillRect(player.x + 10, player.y + 18, 10, 2);

  }, [player, collectibles, obstacles, platforms, npcs, particles, gameState.currentScene]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🌍 Eco Adventure</h3>
        <div className="flex gap-4 text-sm">
          <span className="badge badge-primary">Score: {gameState.score}</span>
          <span className="badge badge-secondary">Level: {gameState.level}</span>
          <span className="badge badge-error">Lives: {gameState.lives}</span>
          <span className="badge badge-warning">Time: {formatTime(gameState.timeLeft)}</span>
        </div>
      </div>

      {/* Current Scene */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-700">
          {scenes[gameState.currentScene].name}
        </h4>
      </div>

      {/* Game Canvas */}
      <div className="game-area mb-4 flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-sky-200 to-green-200"
        />
      </div>

      {/* Controls Info */}
      <div className="controls mb-4 text-center">
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <FaArrowLeft />
            <FaArrowRight />
            <span className="text-sm">Move</span>
          </div>
          <div className="flex items-center gap-1">
            <FaArrowUp />
            <span className="text-sm">Jump</span>
          </div>
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
            Start Adventure
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className={`btn btn-outline ${gameState.isPlaying ? 'ml-4' : 'ml-2'}`}
        >
          <FaRedo className="mr-2" />
          New Adventure
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
                {gameState.won ? 'Adventure Complete!' : 'Adventure Over!'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Reached Level {gameState.level} with {gameState.score} points
            </div>
          </motion.div>
        )}
      </div>

      {/* Game Instructions */}
      <div className="instructions p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use arrow keys to move and jump through environments</li>
          <li>• Collect eco-friendly items to score points</li>
          <li>• Avoid obstacles that harm the environment</li>
          <li>• Complete all three levels: Forest → River → City</li>
          <li>• Talk to NPCs for environmental tips and guidance</li>
        </ul>
      </div>

      {/* Environmental Message */}
      <div className="environmental-message mt-4 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-green-800">🌱 Learn & Act:</h4>
        <div className="text-sm text-green-700 space-y-1">
          <div>• Every small action helps protect our environment</div>
          <div>• Plant trees, clean water bodies, use renewable energy</div>
          <div>• Reduce, reuse, recycle in your daily life</div>
          <div>• Be an environmental hero in your community!</div>
        </div>
      </div>
    </div>
  );
};

export default EcoAdventureGame;