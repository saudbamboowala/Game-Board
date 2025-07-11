import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      setScores(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }));
    } else if (newBoard.every(cell => cell)) {
      setWinner('Draw');
      setGameOver(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const getStatusMessage = () => {
    if (winner === 'Draw') return "🎨 It's a draw!";
    if (winner) return `🏆 Winner: ${winner}`;
    return `🎯 Next player: ${isXNext ? 'X' : 'O'}`;
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
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          Tic-Tac-Toe
        </h1>

        {/* Scoreboard */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#4c1d95',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              🎮 Player X: {scores.X}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#7c2d92',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              🤝 Draws: {scores.draws}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#be185d',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              🎯 Player O: {scores.O}
            </span>
          </div>
          <button 
            onClick={resetScores}
            style={{
              fontSize: '12px',
              color: '#7c2d92',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            🔄 Reset Scores
          </button>
        </div>

        {/* Game Status */}
        <div style={{
          background: winner === 'X' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 
                     winner === 'O' ? 'linear-gradient(135deg, #ec4899, #f59e0b)' : 
                     winner === 'Draw' ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 
                     'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: '24px',
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
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={gameOver || board[index]}
              style={{
                width: '100%',
                height: '100px',
                fontSize: '42px',
                fontWeight: 'bold',
                borderRadius: '16px',
                border: value ? '3px solid' : '3px solid rgba(139, 92, 246, 0.3)',
                borderColor: value === 'X' ? '#06b6d4' : value === 'O' ? '#ec4899' : 'rgba(139, 92, 246, 0.3)',
                background: value === 'X' ? 'linear-gradient(135deg, #cffafe, #bfdbfe)' : 
                           value === 'O' ? 'linear-gradient(135deg, #fce7f3, #fed7aa)' : 
                           'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: value === 'X' ? '#0891b2' : value === 'O' ? '#be185d' : '#6b7280',
                cursor: (gameOver || board[index]) ? 'not-allowed' : 'pointer',
                opacity: (gameOver || board[index]) ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!gameOver && !board[index]) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.3)';
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                }
              }}
              onMouseLeave={(e) => {
                if (!gameOver && !board[index]) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                }
              }}
            >
              {value}
            </button>
          ))}
        </div>

        {/* New Game Button */}
        <button
          onClick={resetGame}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
            padding: '16px 24px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
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
          ✨ New Game
        </button>

        {/* Instructions */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            color: '#7c2d92',
            lineHeight: '1.6',
            fontWeight: '500',
            margin: 0
          }}>
            🎮 Click on any square to make your move
            <br />
            <span style={{ color: '#be185d', fontWeight: 'bold' }}>
              🏆 Get three in a row to win!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;