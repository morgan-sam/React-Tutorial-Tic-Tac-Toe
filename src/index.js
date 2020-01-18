import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const GAME_TILE_DIMENSION = 3;

const SQUARE_KEYS = Array.from(Array(Math.pow(GAME_TILE_DIMENSION, 2))).map(e =>
  genKey()
);

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {" "}
      {props.value}{" "}
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

    return <div> {items} </div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      xIsNext: !this.state.xIsNext
    });
  }

  render() {
    const history = this.state.history;
    const current = history[history.length - 1];
    const winner = calculateWinner(current.squares);
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={i => this.handleClick(i)} />{" "}
        </div>{" "}
        <div className="game-info">
          <div> {status} </div> <ol> {/* TODO */} </ol>{" "}
        </div>{" "}
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = calculateWinningLines(GAME_TILE_DIMENSION);
  let coords = Array(GAME_TILE_DIMENSION).fill(null);
  for (let i = 0; i < lines.length; i++) {
    coords = lines[i];
    coords = coords.map(el => squares[el]);
    if (allEqual(coords)) return coords[0];
  }
  return null;
}

function calculateWinningLines(dimension) {
  let winningLines = [];
  //horizontal
  for (let i = 0; i < dimension; i++) {
    winningLines.push([...Array(dimension).keys()].map(x => x + i * dimension));
  }
  //vertical
  for (let i = 0; i < dimension; i++) {
    winningLines.push([...Array(dimension).keys()].map(x => dimension * x + i));
  }
  //diagonals
  winningLines.push(
    [...Array(dimension).keys()].map(x => dimension - 1 + x * (dimension - 1))
  );
  winningLines.push([...Array(dimension).keys()].map(x => x * (dimension + 1)));

  return winningLines;
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

ReactDOM.render(<Game />, document.getElementById("root"));
