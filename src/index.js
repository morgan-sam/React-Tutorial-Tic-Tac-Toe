import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const LINE_WIN_SIZE = 3;

function Square(props) {
	return (
		<button className={'square ' + (props.isWon ? 'wonSquare' : null)} onClick={props.onClick}>
			{' '}
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
				key={i}
				isWon={this.props.winningSquares.includes(i)}
			/>
		);
	}

	render() {
		const items = [];
		for (let i = 0; i < this.props.boardDimension; i++) {
			let children = [];
			for (let j = 0; j < this.props.boardDimension; j++) {
				children.push(this.renderSquare(j + i * this.props.boardDimension));
			}
			items.push(
				<div className="board-row" key={i}>
					{' '}
					{children}{' '}
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
					squares: Array(Math.pow(this.props.boardDimension, 2)).fill(null)
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
		if (this.calculateWonTiles(squares).length > 0 || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([
				{
					squares: squares
				}
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: step % 2 === 0
		});
	}

	calculateWonTiles(squares) {
		const lines = this.calculateWinningLines(this.props.boardDimension, LINE_WIN_SIZE);
		let coords = Array(this.props.boardDimension).fill(null);
		for (let i = 0; i < lines.length; i++) {
			coords = lines[i].map((el) => squares[el]);
			if (this.allEqual(coords)) return lines[i];
		}
		return [];
	}

	calculateWinningLines(dimension, winsize) {
		let winningLines = [];

		//horizontal
		let horizontal = [];
		for (let i = 0; i < dimension; i++) {
			horizontal.push([ ...Array(dimension).keys() ].map((x) => x + i * dimension));
		}
		//vertical
		let vertical = [];
		for (let i = 0; i < dimension; i++) {
			vertical.push([ ...Array(dimension).keys() ].map((x) => dimension * x + i));
		}

		//diagonals
		let diagonal = [];

		for (let i = -dimension + winsize; i <= dimension - winsize; i++) {
			//downright, starts top centre tile, finishes starting on left centre
			diagonal.push(
				[ ...Array(dimension - Math.abs(i)).keys() ].map((x) => -i + (dimension + 1) * (x + Math.max(0, i)))
			);
			//downleft, starts right centre tile, finishes starting on top centre
			diagonal.push(
				[ ...Array(dimension - Math.abs(i)).keys() ].map(
					(x) => dimension * i + (dimension - 1) * (1 + x - Math.min(0, i))
				)
			);
		}

		winningLines.push(this.splitLinesIntoWinLines(horizontal));
		winningLines.push(this.splitLinesIntoWinLines(vertical));
		winningLines.push(this.splitLinesIntoWinLines(diagonal));
		winningLines = winningLines.flat();
		return winningLines;
	}

	splitLinesIntoWinLines(input, winsize = LINE_WIN_SIZE) {
		let winlines = [];
		input.forEach(function(el) {
			for (let i = 0; i < el.length - (winsize - 1); i++) {
				winlines.push(el.slice(i, i + winsize));
			}
		});
		return winlines;
	}

	allEqual(arr) {
		return arr.every((el) => el === arr[0] && arr[0] !== null);
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		let winningSquares = this.calculateWonTiles(current.squares);

		const moves = history.map((step, move) => {
			const desc = move ? 'Go to move #' + move : 'Go to game start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		let status;
		if (winningSquares.length > 0) {
			status = 'Winner: ' + current.squares[winningSquares[0]];
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board
						boardDimension={this.props.boardDimension}
						winningSquares={winningSquares}
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>{' '}
				</div>
				<div className="game-info">
					<div> {status} </div>
					<ol> {moves} </ol>
				</div>
			</div>
		);
	}
}
class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			gameActive: false,
			boardDimensions: 3
		};
	}

	toggleGame(boo) {
		this.setState({
			gameActive: boo
		});
	}
	setBoardDimensions(value) {
		this.setState({
			boardDimensions: value
		});
	}

	render() {
		let boardDimChildren = [];
		for (let i = 3; i <= 10; i++) {
			boardDimChildren.push(
				<option value={i} key={i}>
					{i}
				</option>
			);
		}
		let gameDisplay, menuOptions;
		if (this.state.gameActive) {
			gameDisplay = [ <Game boardDimension={this.state.boardDimensions} key={'game'} /> ];
			menuOptions = null;
		} else {
			gameDisplay = null;
			menuOptions = [
				<button onClick={() => this.toggleGame(true)}>Start</button>,
				<select defaultValue={'DEFAULT'} onChange={(e) => this.setBoardDimensions(parseInt(e.target.value))}>
					<option value="DEFAULT" disabled hidden>
						Select Board Dimensions
					</option>
					{boardDimChildren}
				</select>
			];
		}

		return (
			<div>
				{menuOptions}
				{gameDisplay}
			</div>
		);
	}
}

// ========================================

ReactDOM.render(<App />, document.getElementById('root'));
