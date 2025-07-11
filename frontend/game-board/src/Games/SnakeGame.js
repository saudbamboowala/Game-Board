import React, { useState, useEffect, useCallback } from 'react';

const SnakeGame = () => {
  const GRID_SIZE = 20;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const INITIAL_FOOD = { x: 5, y: 5 };
  const INITIAL_DIRECTION = { x: 0, y: -1 };

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snakeHighScore') || '0'));
  const [speed, setSpeed] = useState(300);

  // Generate random food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // Check collision with walls or self
  const checkCollision = useCallback((head) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        // Check collision
        if (checkCollision(head)) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
          setScore(prevScore => {
            const newScore = prevScore + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood());
          // Increase speed slightly
          setSpeed(prevSpeed => Math.max(150, prevSpeed - 3));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, direction, food, checkCollision, generateFood, speed, highScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && !gameOver) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          setGameStarted(true);
        }
      }

      if (gameStarted && !gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            setDirection(prev => prev.y === 0 ? { x: 0, y: -1 } : prev);
            break;
          case 'ArrowDown':
            setDirection(prev => prev.y === 0 ? { x: 0, y: 1 } : prev);
            break;
          case 'ArrowLeft':
            setDirection(prev => prev.x === 0 ? { x: -1, y: 0 } : prev);
            break;
          case 'ArrowRight':
            setDirection(prev => prev.x === 0 ? { x: 1, y: 0 } : prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setSpeed(300);
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const getStatusMessage = () => {
    if (gameOver) return "🎮 Game Over! Press 'New Game' to restart";
    if (!gameStarted) return "🚀 Press arrow keys to start!";
    return "🐍 Use arrow keys to control the snake";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        padding: '20px',
        width: '100%',
        maxWidth: '90vw',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 48px)',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🐍 Snake Game
        </h1>

        {/* Score Board */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              color: '#4c1d95',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              🏆 Score: {score}
            </div>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 'bold',
              color: '#be185d',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              🔥 High Score: {highScore}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div style={{
          background: gameOver ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 
                     gameStarted ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 
                     'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {getStatusMessage()}
          </h2>
        </div>

        {/* Game Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '1px',
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          borderRadius: '16px',
          padding: '12px',
          marginBottom: '20px',
          border: '3px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          margin: '0 auto 20px auto',
          aspectRatio: '1'
        }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                style={{
                  width: '100%',
                  height: '100%',
                  minWidth: '15px',
                  minHeight: '15px',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  background: isFood ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                            isHead ? 'linear-gradient(135deg, #10b981, #059669)' :
                            isSnake ? 'linear-gradient(135deg, #34d399, #10b981)' :
                            'linear-gradient(135deg, #6b7280, #4b5563)',
                  border: isFood ? '2px solid #fbbf24' :
                         isHead ? '2px solid #047857' :
                         isSnake ? '2px solid #065f46' :
                         '1px solid rgba(156, 163, 175, 0.3)',
                  boxShadow: isFood ? '0 0 10px rgba(245, 158, 11, 0.5)' :
                            isHead ? '0 0 8px rgba(16, 185, 129, 0.5)' :
                            isSnake ? '0 0 4px rgba(52, 211, 153, 0.3)' :
                            'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(8px, 2vw, 12px)',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.1s ease'
                }}
              >
                {isFood ? '🍎' : isHead ? '👀' : ''}
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px',
          flexDirection: window.innerWidth < 480 ? 'column' : 'row'
        }}>
          <button
            onClick={resetGame}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 'clamp(14px, 3vw, 16px)',
              padding: '16px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 12px 48px rgba(139, 92, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.4)';
            }}
          >
            🔄 New Game
          </button>
          {!gameStarted && !gameOver && (
            <button
              onClick={startGame}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 'clamp(14px, 3vw, 16px)',
                padding: '16px 24px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)';
              }}
            >
              🚀 Start Game
            </button>
          )}
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            borderRadius: '16px',
            padding: '20px',
            border: '2px solid rgba(139, 92, 246, 0.2)'
          }}>
            <p style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#374151',
              lineHeight: '1.6',
              fontWeight: '500',
              margin: '0 0 12px 0'
            }}>
              🎮 <strong>Controls:</strong> Use arrow keys to move the snake
            </p>
            <p style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#6b7280',
              lineHeight: '1.6',
              fontWeight: '500',
              margin: 0
            }}>
              🍎 Eat the red apples to grow and increase your score!
              <br />
              🚫 Avoid hitting the walls or yourself
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;