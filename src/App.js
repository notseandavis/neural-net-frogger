import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import RenderGame from './Game/RenderGame';
import gameStart from './gamestart'
import { Button } from 'react-bootstrap'
import NNet from './nnet';
import _ from 'lodash';
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFrog } from '@fortawesome/free-solid-svg-icons'


class App extends Component {
  
  constructor() {
    super();

    this.state = {
      game: _.map(gameStart, _.clone),
      gameOver: false,
      wonGame: false,
      jumping: false,
      score: 0,
      neuralNetRunning: false,
      playerRunning: false,
      playerRunning: false,
      generation: 0,
      speed: 1000,
      topScore: 0,
    };
    this.gameMap = _.map(gameStart, _.clone);
    this.nnet = new NNet([[2],[2]], 1, 2);
    this.startGame = this.startGame.bind(this);
    this.startNeuralNetGame = this.startNeuralNetGame.bind(this);
    this.increaseSpeed = this.increaseSpeed.bind(this)
    this.decreaseSpeed = this.decreaseSpeed.bind(this)
  }

  isGameOver(game, jumping) {
    if (jumping > 0 && game[0][0] === 1) {
      return true;
    }

    if (jumping === 0 && game[1][0] === 1) {
      return true;
    }
    return false;
  }

  handleKeyDown = (event) => {
    if (!this.state.gameOver) {
      // only jump if you are not in the air
      if (this.state.jumping === 0) {
        if(event.key === 'w') {
          this.setState({jumping: 1});
        }
      }
    }
  }

  incrementGame() {
    if (this.state.game[0].length > 1 && !this.state.gameOver) {
      let game = this.state.game;
      let jumping = 0;
      // if you are already in the air, stay there
      // TODO: figure out how to make this guy plan ahead, only works for humans right now
      if (!this.state.neuralNetRunning && this.state.jumping === 1) {
        jumping = 2;
      }
      if (this.state.neuralNetRunning && this.state.jumping === 0) {
        // TODO this is ugly
        let shouldJump = this.nnet.fire([[game[0][1], game[1][1]], [game[0][2], game[1][2]]]);
        jumping = shouldJump > .6 ? 1 : 0;

      }

      game[0].splice(0, 1);
      game[1].splice(0, 1);
      this.setState({game, jumping, score: this.state.score + 1});
      
      if (this.isGameOver(game, this.state.jumping)) {
        this.setState({gameOver:true, wonGame: false, topScore: this.state.score > this.state.topScore ? this.state.score : this.state.topScore});
        
        if (this.state.neuralNetRunning) {
          let shouldHaveJumped = jumping > 0 && game[0][0] > 0 ? 0 : 1;

          // TODO this is ugly
          this.nnet.train([[game[0][0], game[1][0]], [game[0][1], game[1][1]]], shouldHaveJumped)
          setTimeout(this.resetGameNN.bind(this), this.state.speed);
        }

      } else {
        setTimeout(this.incrementGame.bind(this), this.state.speed);
      }
    } else {
      this.setState({gameOver:true, playerRunning: false, wonGame: true, topScore: this.state.score});
    }
  }

  resetGameNN() {
    let topScore = this.state.topScore;
    if (this.state.score > this.state.topScore) {
      topScore = this.state.score + " (by AI)";
    }
    this.setState({
      game: _.map(this.gameMap, _.clone),
      gameOver: false,
      jumping: 0,
      score: 0,
      neuralNetRunning: true,
      generation: this.state.generation + 1,
      topScore: topScore
    }, this.incrementGame);
  }


  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  }

  startGame() {
    this.setState({
      game: _.map(gameStart, _.clone),
      gameOver: false,
      jumping: 0,
      score: 0,
      neuralNetRunning: false,
      generation: 0,
      playerRunning: true
    })

    setTimeout(this.incrementGame.bind(this), this.state.speed);
  }
  startNeuralNetGame() {
    setTimeout(this.resetGameNN.bind(this), this.state.speed);
  }

  increaseSpeed() {
    this.setState({speed: this.state.speed + 100})
  }
  decreaseSpeed() {
    this.setState({speed: this.state.speed - 100})
  }

  render() {
    let runningClass = this.state.playerRunning || this.state.neuralNetRunning ? 'gamerunning ' + this.state.speed : '';
    // let weights = {
    //   'Input 1 Weight': this.state.weights.i1_h1,
    //   'Input 2 Weight':this.state.weights.i2_h1,
    //   'Bias': this.state.weights.bias_h1,
    // }
    let weights = {
      "Input 1" : {
        weights: {
          1: this.state.weights.i1_h1,
          2: this.state.weights.i2_h1
        },
        bias: this.state.weights.bias_h1
      },
      "Input 2": {
        weights: {
          1: this.state.weights.i1_h2,
          2: this.state.weights.i2_h2
        },
        bias: this.state.weights.bias_h2
      },
      output: {
        inputWeights: {
          1: this.state.weights.h1_o1,
          2: this.state.weights.h2_o1
        },
        bias: this.state.weights.bias_o1
      }
    }
    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <header className="App-header">
              <h1 className="App-title">Frogger</h1>
            </header>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <p>Press W key to jump.</p>
            <p>Score: {this.state.score}</p>
            <p>Top Score: {this.state.topScore}</p>
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
        {this.state.gameOver && !this.state.wonGame && <div className="row">
          <div className="col-xs-12 text-danger">
            <h2>Game over!</h2>
          </div>
        </div>}
        {this.state.gameOver && this.state.wonGame && <div className="row">
          <div className="col-xs-12 text-success">
            <h2>You win!</h2>
          </div>
        </div>}
        {!this.state.gameOver && this.state.neuralNetRunning && <div className="row">
          <div className="col-xs-12">
            <h2>Neural Net Running...</h2>
          </div>
        </div>}
        {this.state.playerRunning && !this.state.neuralNetRunning && <div className="row">
          <div className="col-xs-12">
            <h2>Player Running</h2>
          </div>
        </div>}
        {!this.state.gameOver && !this.state.playerRunning && !this.state.neuralNetRunning && <div className="row">
          <div className="col-xs-12">
            <h2>Stopped</h2>
          </div>
        </div>}
        <div className="row game">
          <div className="col-xs-12">
            <div className={runningClass} >
              <RenderGame game={this.state.game}/>
            </div>
            <div className="row">
              <div className="col-xs-1">
                <div className={this.state.jumping != 0 ? 'player jumping' : 'player'}><FontAwesomeIcon size='3x' icon={faFrog} /></div>
              </div>
            </div>
          </div>
        </div>
        <br/>
        <p>Weights:<pre className="h3">{JSON.stringify(this.nnet, null, 2)}</pre></p>
      </div>
    );
  }
}

export default App;
