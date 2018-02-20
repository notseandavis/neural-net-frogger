import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import RenderGame from './Game/RenderGame';
import gameStart from './gamestart'
import { Button } from 'react-bootstrap'
import NeuralNet from './recursiveinputneuralnet';
import _ from 'lodash';

class App extends Component {
  
  constructor() {
    super();

    this.state = {
      game: _.map(gameStart, _.clone),
      gameOver: false,
      jumping: false,
      score: 0,
      neuralNetRunning: false,
      generation: 0,
      speed: 300
    };
    this.gameMap = _.map(gameStart, _.clone);

    this.startGame = this.startGame.bind(this);
    this.startNeuralNetGame = this.startNeuralNetGame.bind(this);
    this.increaseSpeed = this.increaseSpeed.bind(this)
    this.decreaseSpeed = this.decreaseSpeed.bind(this)
    this.nn = new NeuralNet(2);
  }

  isGameOver(game, jumping) {
    if (jumping && game[0][0] === 1) {
      return 1;
    }

    if (!jumping && game[1][0] === 1) {
      return 1;
    }
    return 0;
  }

  handleKeyDown = (event) => {
    if(event.key === ' ') {
      this.setState({jumping: true});
    }
  }

  handleKeyUp = (event) => {
    if(event.key === ' ') {
      this.setState({jumping: false});
    }
  }

  incrementGame() {
    if (this.state.score > gameStart[0].length) {
      return this.setState({gameOver:true});
    }
    let game = this.state.game;

    game[0].splice(0, 1);
    game[1].splice(0, 1);
    this.setState({game, score: this.state.score + 1});
    
    if (this.isGameOver(game, this.state.jumping)) {
      this.setState({gameOver:true});
    } else {
      setTimeout(this.incrementGame.bind(this), this.state.speed);
    }
  }

  resetGameNN() {
    this.setState({
      game: _.map(this.gameMap, _.clone),
      gameOver: false,
      jumping: false,
      score: 0,
      neuralNetRunning: true,
      generation: this.state.generation + 1
    }, this.incrementGameNN);
    ;
  }
  incrementGameNN() {


    let game = this.state.game;

    game[0].splice(0, 1);
    game[1].splice(0, 1);
    let score = this.state.score + 1;


    if (score === gameStart[0].length) {
      console.log('game won)');
      return this.resetGameNN();
    }

    const i1 = game[0][0];
    const i2 = game[1][0];
    
    const jumping = this.nn.shouldJump([i1, i2]);

    const gameOver = this.isGameOver(game, jumping);



    let expectedOutput = null;
    if (jumping && i1 === 1) {
      expectedOutput = 0;
    } if (!jumping && i2 === 1) {
      expectedOutput = 1;
    } else {
      // expectedOutput = 0;
    }
    
    if (expectedOutput !== null) {
      this.nn.train([i1, i2], expectedOutput);
    }

    this.setState({game, score, jumping});


    if (gameOver) {
      console.log('game over)');
      this.resetGameNN();
    } else {

      setTimeout(this.incrementGameNN.bind(this), this.state.speed);
    }


  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  }

  startGame() {
    this.setState({
      game: _.map(gameStart, _.clone),
      gameOver: false,
      jumping: false,
      score: 0,
      neuralNetRunning: false,
      generation: 0
    })

    setTimeout(this.incrementGame.bind(this), this.state.speed);
  }
  startNeuralNetGame() {
    setTimeout(this.incrementGameNN.bind(this), this.state.speed);
  }

  increaseSpeed() {
    this.setState({speed: this.state.speed + 100})
  }
  decreaseSpeed() {
    this.setState({speed: this.state.speed - 100})
  }

  render() {

    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <header className="App-header">
              <h1 className="App-title">Welcome to game.</h1>
            </header>
          </div>
        </div>
        <div className="row">
          <div class="col-xs-12">
            <p>Press space to jump.</p>
            <p>Score: {this.state.score}</p>
            {this.state.neuralNetRunning && <p>Generation: {this.state.generation}</p>}
          </div>
          <div className="col-sm-6">
            <Button onClick={this.startGame}>Start Game</Button>
            <Button onClick={this.startNeuralNetGame}>Start Neural Net</Button>
          </div>
          <div className="col-sm-6">
            <Button onClick={this.increaseSpeed}>+</Button>
            <Button onClick={this.decreaseSpeed}>-</Button>
            Speed: {this.state.speed}ms            
          </div>
        </div>
        {this.state.gameOver && <div className="row">
          <div className="col-xs-12 bg-danger">
            <h2>Game over!</h2>
          </div>
        </div>}
        <div className="row">
          <div className="col-xs-12">
            <RenderGame game={this.state.game}/>
            <div className="row">
              <div className="col-xs-1">
                <div className={this.state.jumping ? 'player jumping' : 'player'}>A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
