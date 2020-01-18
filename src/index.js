import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const GAME_TILE_DIMENSION = 5;
const LINE_WIN_SIZE = 3;

const SQUARE_KEYS = Array.from(Array(Math.pow(GAME_TILE_DIMENSION, 2))).map(e =>
    genKey(),
);

function Square(props) {
  return (
    <button
      className={"square " + (props.isWon ? "wonSquare" : null)}
      onClick={props.onClick}
    >
      {" "}
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={SQUARE_KEYS[i]}
        isWon={this.props.winningSquares.includes(i)}
      />
    );
  }

  render() {
    const items = [];
    for (let i = 0; i < GAME_TILE_DIMENSION; i++) {
      let children = [];
      for (let j = 0; j < GAME_TILE_DIMENSION; j++) {
        children.push(this.renderSquare(j + i * GAME_TILE_DIMENSION));
      }
      items.push(
        <div className="board-row" key={i}>
          {" "}
          {children}{" "}
        </div>
      );
    }

    render() {
        const items = [];
        for (let i = 0; i < GAME_TILE_DIMENSION; i++) {
            let children = [];
            for (let j = 0; j < GAME_TILE_DIMENSION; j++) {
                children.push(this.renderSquare(j + i * GAME_TILE_DIMENSION));
            }
            items.push(
                <div className="board-row" key={i}>
                    {' '}
                    {children}{' '}
                </div>,
            );
        }

        return <div> {items} </div>;
    }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(Math.pow(GAME_TILE_DIMENSION, 2)).fill(null)
        }
      ],
      xIsNext: true,
      stepNumber: 0
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWonTiles(squares).length > 0 || squares[i]) {
      return;
    }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    let winningSquares = calculateWonTiles(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winningSquares.length > 0) {
      status = "Winner: " + winningSquares;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winningSquares={[5, 9, 12]}
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />{" "}
        </div>
        <div className="game-info">
          <div> {status} </div>
          <ol> {moves} </ol>
        </div>
      </div>
    );
  }
}

function calculateWonTiles(squares) {
  const lines = calculateWinningLines(GAME_TILE_DIMENSION, LINE_WIN_SIZE);
  let coords = Array(GAME_TILE_DIMENSION).fill(null);
  for (let i = 0; i < lines.length; i++) {
    coords = lines[i].map(el => squares[el]);
    if (allEqual(coords)) return lines[i];
  }
  return [];
}

function calculateWinningLines(dimension, winsize) {
  let winningLines = [];

  //horizontal
  let horizontal = [];
  for (let i = 0; i < dimension; i++) {
    horizontal.push([...Array(dimension).keys()].map(x => x + i * dimension));
  }
  //vertical
  let vertical = [];
  for (let i = 0; i < dimension; i++) {
    vertical.push([...Array(dimension).keys()].map(x => dimension * x + i));
  }

  //diagonals
  let diagonal = [];

  for (let i = -dimension + winsize; i <= dimension - winsize; i++) {
    //downright, starts top centre tile, finishes starting on left centre
    diagonal.push(
      [...Array(dimension - Math.abs(i)).keys()].map(
        x => -i + (dimension + 1) * (x + Math.max(0, i))
      )
    );
    //downleft, starts right centre tile, finishes starting on top centre
    diagonal.push(
      [...Array(dimension - Math.abs(i)).keys()].map(
        x => dimension * i + (dimension - 1) * (1 + x - Math.min(0, i))
      )
    );
  }

  winningLines.push(splitLinesIntoWinLines(horizontal));
  winningLines.push(splitLinesIntoWinLines(vertical));
  winningLines.push(splitLinesIntoWinLines(diagonal));
  winningLines = winningLines.flat();
  return winningLines;
}

function splitLinesIntoWinLines(input, winsize = LINE_WIN_SIZE) {
  let winlines = [];
  input.forEach(function(el) {
    for (let i = 0; i < el.length - (winsize - 1); i++) {
      winlines.push(el.slice(i, i + winsize));
    }

    winningLines.push(splitLinesIntoWinLines(horizontal));
    winningLines.push(splitLinesIntoWinLines(vertical));
    winningLines.push(splitLinesIntoWinLines(diagonal));
    winningLines = winningLines.flat();
    return winningLines;
}

function splitLinesIntoWinLines(input, winsize = LINE_WIN_SIZE) {
    let winlines = [];
    input.forEach(function(el) {
        for (let i = 0; i < el.length - (winsize - 1); i++) {
            winlines.push(el.slice(i, i + winsize));
        }
    });
    return winlines;
}

function allEqual(arr) {
    return arr.every(el => el === arr[0] && arr[0] !== null);
}
// ========================================

function genKey() {
    return Math.random()
        .toString(36)
        .substr(2, 10);
}

ReactDOM.render(<Game />, document.getElementById('root'));
