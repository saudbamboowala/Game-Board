import React, { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

// Tetris pieces with vibrant colors
const PIECES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f5ff',
    rotations: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]]
    ]
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '#ffeb3b',
    rotations: [[[1, 1], [1, 1]]]
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: '#9c27b0',
    rotations: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]]
    ]
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: '#4caf50',
    rotations: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]]
    ]
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: '#f44336',
    rotations: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]]
    ]
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: '#2196f3',
    rotations: [
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[0, 1], [0, 1], [1, 1]]
    ]
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: '#ff9800',
    rotations: [
      [[0, 0, 1], [1, 1, 1]],
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]]
    ]
  }
};

const PIECE_KEYS = Object.keys(PIECES);

const Tetris = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState(1000);
  const [clearedLines, setClearedLines] = useState([]);
  
  const gameLoop = useRef(null);
  const dropTimeRef = useRef(dropTime);

  const createPiece = useCallback(() => {
    const pieceKey = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
    const piece = PIECES[pieceKey];
    return {
      type: pieceKey,
      shape: piece.rotations[0],
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.rotations[0][0].length / 2),
      y: 0,
      rotation: 0
    };
  }, []);

  const isValidMove = useCallback((piece, newX, newY, newRotation = piece.rotation) => {
    const shape = PIECES[piece.type].rotations[newRotation];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (boardY >= 0 && board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, [board]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    const shape = PIECES[currentPiece.type].rotations[currentPiece.rotation];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    
    setBoard(newBoard);
    return newBoard;
  }, [board, currentPiece]);

  const clearLines = useCallback((newBoard) => {
    let linesCleared = 0;
    const clearedBoard = [];
    const clearedLineIndices = [];
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        linesCleared++;
        clearedLineIndices.push(y);
      } else {
        clearedBoard.unshift(newBoard[y]);
      }
    }
    
    // Add animation for cleared lines
    if (clearedLineIndices.length > 0) {
      setClearedLines(clearedLineIndices);
      setTimeout(() => setClearedLines([]), 300);
    }
    
    while (clearedBoard.length < BOARD_HEIGHT) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level * (linesCleared > 1 ? linesCleared : 1));
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
    }
    
    return { board: clearedBoard, linesCleared };
  }, [level, lines]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || !gameRunning) return;
    
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      const newBoard = placePiece();
      const { board: clearedBoard } = clearLines(newBoard);
      setBoard(clearedBoard);
      
      const newPiece = nextPiece || createPiece();
      const nextNewPiece = createPiece();
      
      if (isValidMove(newPiece, newPiece.x, newPiece.y)) {
        setCurrentPiece(newPiece);
        setNextPiece(nextNewPiece);
      } else {
        setGameOver(true);
        setGameRunning(false);
      }
    }
  }, [currentPiece, gameRunning, isValidMove, placePiece, clearLines, nextPiece, createPiece]);

  const movePiece = useCallback((dx, dy) => {
    if (!currentPiece || !gameRunning) return;
    
    if (isValidMove(currentPiece, currentPiece.x + dx, currentPiece.y + dy)) {
      setCurrentPiece(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  }, [currentPiece, gameRunning, isValidMove]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || !gameRunning) return;
    
    const maxRotations = PIECES[currentPiece.type].rotations.length;
    const newRotation = (currentPiece.rotation + 1) % maxRotations;
    
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, newRotation)) {
      setCurrentPiece(prev => ({ ...prev, rotation: newRotation }));
    }
  }, [currentPiece, gameRunning, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || !gameRunning) return;
    
    let dropDistance = 0;
    while (isValidMove(currentPiece, currentPiece.x, currentPiece.y + dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + dropDistance }));
      setScore(prev => prev + dropDistance * 2);
    }
  }, [currentPiece, gameRunning, isValidMove]);

  const startGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setGameRunning(true);
    setClearedLines([]);
    
    const firstPiece = createPiece();
    const secondPiece = createPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
  }, [createPiece]);

  const pauseGame = useCallback(() => {
    setGameRunning(prev => !prev);
  }, []);

  // Update drop time based on level
  useEffect(() => {
    const newDropTime = Math.max(50, 1000 - (level - 1) * 80);
    setDropTime(newDropTime);
    dropTimeRef.current = newDropTime;
  }, [level]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameLoop.current = setInterval(dropPiece, dropTimeRef.current);
    } else {
      clearInterval(gameLoop.current);
    }
    
    return () => clearInterval(gameLoop.current);
  }, [dropPiece, gameRunning, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          dropPiece();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          rotatePiece();
          break;
        case 'Enter':
          e.preventDefault();
          hardDrop();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, movePiece, dropPiece, rotatePiece, hardDrop]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add ghost piece (shadow)
    if (currentPiece) {
      let ghostY = currentPiece.y;
      while (isValidMove(currentPiece, currentPiece.x, ghostY + 1)) {
        ghostY++;
      }
      
      const shape = PIECES[currentPiece.type].rotations[currentPiece.rotation];
      
      // Render ghost piece
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = ghostY + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH && !displayBoard[boardY][boardX]) {
              displayBoard[boardY][boardX] = 'ghost';
            }
          }
        }
      }
      
      // Render current piece
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return (
      <div 
        className="grid gap-px bg-gray-900 p-2 border-4 border-gray-700 rounded-xl shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`
        }}
      >
        {displayBoard.flat().map((cell, index) => {
          const row = Math.floor(index / BOARD_WIDTH);
          const isCleared = clearedLines.includes(row);
          const isGhost = cell === 'ghost';
          
          return (
            <div
              key={index}
              className={`rounded-sm transition-all duration-150 border ${
                isCleared ? 'animate-pulse bg-white' : 
                isGhost ? 'border-2 border-dashed opacity-50' :
                'hover:brightness-110'
              }`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: isGhost ? 'transparent' : (cell || '#111'),
                borderColor: isGhost ? '#666' : (cell && cell !== '#111' ? 'rgba(255,255,255,0.3)' : '#333'),
                boxShadow: cell && cell !== '#111' && !isGhost ? `0 0 10px ${cell}40` : 'none'
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const shape = PIECES[nextPiece.type].rotations[0];
    const maxSize = Math.max(shape.length, shape[0]?.length || 0);
    const gridSize = Math.max(4, maxSize);
    
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    const offsetY = Math.floor((gridSize - shape.length) / 2);
    const offsetX = Math.floor((gridSize - (shape[0]?.length || 0)) / 2);
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < (shape[y]?.length || 0); x++) {
        if (shape[y][x]) {
          grid[offsetY + y][offsetX + x] = nextPiece.color;
        }
      }
    }
    
    return (
      <div
        className="grid gap-px bg-gray-900 p-2 border-2 border-gray-700 rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 18px)`,
          gridTemplateRows: `repeat(${gridSize}, 18px)`
        }}
      >
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className="rounded-sm border transition-all duration-150"
            style={{
              width: 18,
              height: 18,
              backgroundColor: cell || '#111',
              borderColor: cell && cell !== '#111' ? 'rgba(255,255,255,0.3)' : '#333',
              boxShadow: cell && cell !== '#111' ? `0 0 8px ${cell}60` : 'none'
            }}
          />
        ))}
      </div>
    );
  };

  const getScoreMultiplier = () => {
    const baseScore = Math.floor(score / 1000) + 1;
    return `${baseScore}x`;
  };

  return (
    <div className="flex gap-6 p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen font-mono">
      {/* Game Board */}
      <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-gray-600 shadow-2xl">
        {renderBoard()}
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {/* Score Panel */}
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl shadow-xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
            TETRIS
          </h1>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Score:</span>
              <span className="text-2xl text-white font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Lines:</span>
              <span className="text-xl text-cyan-400 font-semibold">{lines}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Level:</span>
              <span className="text-xl text-yellow-400 font-semibold">{level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Multiplier:</span>
              <span className="text-lg text-green-400 font-semibold">{getScoreMultiplier()}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress to Level {level + 1}</span>
              <span>{lines % 10}/10</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((lines % 10) * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Piece */}
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl shadow-xl">
          <h2 className="text-xl text-white mb-4 font-semibold">Next Piece</h2>
          <div className="flex justify-center">
            {renderNextPiece()}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl shadow-xl">
          <h2 className="text-xl text-white mb-4 font-semibold">Controls</h2>
          
          <div className="flex gap-2 flex-wrap mb-4">
            {!gameRunning && !gameOver && (
              <button
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={startGame}
              >
                ▶ Start
              </button>
            )}
            
            {gameRunning && (
              <button
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={pauseGame}
              >
                ⏸ Pause
              </button>
            )}
            
            <button
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={startGame}
            >
              🔄 Reset
            </button>
          </div>

          {gameOver && (
            <div className="mb-4">
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full text-lg shadow-lg animate-pulse">
                GAME OVER
              </span>
            </div>
          )}

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-300 text-sm space-y-1">
              <div><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">↑</kbd> / <kbd className="px-2 py-1 bg-gray-600 rounded text-xs">W</kbd> / <kbd className="px-2 py-1 bg-gray-600 rounded text-xs">Space</kbd> Rotate</div>
              <div><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">←</kbd><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">→</kbd> / <kbd className="px-2 py-1 bg-gray-600 rounded text-xs">A</kbd><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">D</kbd> Move</div>
              <div><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">↓</kbd> / <kbd className="px-2 py-1 bg-gray-600 rounded text-xs">S</kbd> Soft Drop</div>
              <div><kbd className="px-2 py-1 bg-gray-600 rounded text-xs">Enter</kbd> Hard Drop</div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl shadow-xl">
          <h2 className="text-xl text-white mb-3 font-semibold">Status</h2>
          <div className="flex flex-col gap-2">
            <span className={`inline-block px-4 py-2 font-bold rounded-lg text-center shadow-lg transition-all duration-300 ${
              gameRunning ? 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse' : 
              gameOver ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 
              'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
            }`}>
              {gameRunning ? 'PLAYING' : gameOver ? 'GAME OVER' : 'PAUSED'}
            </span>
            
            <div className="text-sm text-gray-400 mt-2">
              Speed: {Math.max(50, 1000 - (level - 1) * 80)}ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;