import React, { useState, useEffect } from 'react';
import './App.css';

/*
  Modern, light-themed Tic-Tac-Toe Game with centered layout, score panel, controls,
  two-player mode & simple AI.
*/

// Helpers
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // 'X' or 'O'
    }
  }
  return null;
}

function findAIMove(squares, aiSymbol, playerSymbol) {
  // Simple AI: Win if possible, block player, pick center/corner/side
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      let test = squares.slice();
      test[i] = aiSymbol;
      if (calculateWinner(test) === aiSymbol) return i;
    }
  }
  // 2. Block player win
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      let test = squares.slice();
      test[i] = playerSymbol;
      if (calculateWinner(test) === playerSymbol) return i;
    }
  }
  // 3. Center
  if (!squares[4]) return 4;
  // 4. Corners
  const corners = [0, 2, 6, 8];
  for (let idx of corners) if (!squares[idx]) return idx;
  // 5. Sides
  const sides = [1, 3, 5, 7];
  for (let idx of sides) if (!squares[idx]) return idx;
  return null;
}

// Board component
function Board({ squares, onSquareClick, disabled }) {
  // PUBLIC_INTERFACE
  return (
    <div className="ttt-board">
      {squares.map((v, idx) => (
        <button
          className="ttt-square"
          key={idx}
          aria-label={`Cell ${idx + 1} ${v ? v : 'empty'}`}
          onClick={() => onSquareClick(idx)}
          disabled={disabled || !!v}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// Score Panel
function ScorePanel({ xScore, oScore, draws, mode, player1Name, player2Name }) {
  // PUBLIC_INTERFACE
  return (
    <div className="ttt-score-panel">
      <div className="ttt-player-score" style={{ color: 'var(--primary-accent)' }}>
        {player1Name} (X): <span>{xScore}</span>
      </div>
      <div className="ttt-draw-score">
        Draws: <span>{draws}</span>
      </div>
      <div className="ttt-player-score" style={{ color: 'var(--score-o-color)' }}>
        {player2Name} (O): <span>{oScore}</span>
      </div>
      <div className="ttt-mode-label"><span>Mode: <b>{mode === 'AI' ? 'Player vs AI' : '2 Players'}</b></span></div>
    </div>
  );
}

// Controls
function Controls({ onRestart, onNewGame, mode, setMode, gameActive }) {
  // PUBLIC_INTERFACE
  return (
    <div className="ttt-controls">
      <button className="ttt-btn ttt-restart-btn" onClick={onRestart} disabled={!gameActive}>Restart Game</button>
      <button className="ttt-btn ttt-newgame-btn" onClick={onNewGame}>New Game (Reset Scores)</button>
      <span style={{ flex: 1 }} />
      <label className="ttt-mode-toggle">
        <input
          type="checkbox"
          checked={mode === 'AI'}
          onChange={() => setMode(mode === 'AI' ? '2P' : 'AI')}
        />
        <span className="ttt-mode-toggle-label">
          {mode === 'AI' ? 'AI Mode' : 'Two Players'}
        </span>
      </label>
    </div>
  );
}

// Root App
// PUBLIC_INTERFACE
function App() {
  // Theme and palette
  const [theme] = useState('light'); // Light theme fixed

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXisNext] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [mode, setMode] = useState('AI'); // 'AI' or '2P'
  // Scores
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [draws, setDraws] = useState(0);

  // Names
  const player1Name = mode === '2P' ? "Player 1" : "You";
  const player2Name = mode === '2P' ? "Player 2" : "AI";

  // CSS custom property for theme palette
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--primary-accent', '#2196f3');
    document.documentElement.style.setProperty('--secondary-bg', '#e3f2fd');
    document.documentElement.style.setProperty('--score-o-color', '#ff9800');
  }, [theme]);

  // Game status checks
  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      setGameActive(false);
      if (w === 'X') setXScore(s => s + 1);
      else setOScore(s => s + 1);
    } else if (board.every(Boolean)) {
      setDraw(true);
      setGameActive(false);
      setDraws(s => s + 1);
    }
    // eslint-disable-next-line
  }, [board]);

  // AI move handler
  useEffect(() => {
    if (mode === 'AI' && !winner && !draw && !xIsNext && gameActive) {
      // Give AI a small delay for UI feedback
      const aiMoveTimeout = setTimeout(() => {
        const idx = findAIMove(board, 'O', 'X');
        if (idx !== null && board[idx] == null) {
          handleSquareClick(idx, true);
        }
      }, 400);
      return () => clearTimeout(aiMoveTimeout);
    }
    // eslint-disable-next-line
  }, [mode, board, winner, draw, xIsNext, gameActive]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (idx, fromAI = false) => {
    if (!gameActive || board[idx]) return;
    // If AI's turn, fromAI should be true, or if two players, human both.
    if (mode === 'AI' && !xIsNext && !fromAI) return;
    const nextBoard = board.slice();
    nextBoard[idx] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXisNext(x => !x);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setGameActive(true);
    setWinner(null);
    setDraw(false);
    setXisNext(true);
  };

  // PUBLIC_INTERFACE
  const newGame = () => {
    setBoard(Array(9).fill(null));
    setGameActive(true);
    setWinner(null);
    setDraw(false);
    setXisNext(true);
    setXScore(0);
    setOScore(0);
    setDraws(0);
  };

  // PUBLIC_INTERFACE
  const handleModeChange = (m) => {
    setMode(m);
    newGame();
  };

  // UI - winner/draw messaging
  let status;
  if (winner) status = (winner === 'X' ? player1Name : player2Name) + ' wins!';
  else if (draw) status = "It's a draw!";
  else status = (mode === 'AI')
      ? (xIsNext ? "Your turn (X)" : "AI's turn (O)")
      : (xIsNext ? "Player 1's turn (X)" : "Player 2's turn (O)");

  return (
    <div className="App" style={{ minHeight: '100vh', background: 'var(--secondary-bg)' }}>
      <main className="ttt-main">
        <h1 className="ttt-title">Tic-Tac-Toe</h1>
        <ScorePanel
          xScore={xScore}
          oScore={oScore}
          draws={draws}
          mode={mode}
          player1Name={player1Name}
          player2Name={player2Name}
        />
        <div className="ttt-status"><span>{status}</span></div>
        <Board
          squares={board}
          onSquareClick={handleSquareClick}
          disabled={!gameActive}
        />
        <Controls
          onRestart={restartGame}
          onNewGame={newGame}
          mode={mode}
          setMode={m => handleModeChange(m)}
          gameActive={gameActive}
        />
        <footer className="ttt-footer">
          <p style={{ color: 'var(--primary-accent)', fontSize: 13, margin: 0, marginTop: 30 }}>
            © {new Date().getFullYear()} Tic-Tac-Toe App &middot; Modern React &middot; KAVIA Template
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
