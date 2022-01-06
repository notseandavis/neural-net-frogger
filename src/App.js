import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import RenderGame from './Game/RenderGame';
import gameStart from './gamestart'
import { Button } from 'react-bootstrap'
import NeuralNode from './neuralnode';
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
      jumping: false,
      score: 0,
      neuralNetRunning: false,
      generation: 0,
      speed: 300,
      topScore: 0
    };
    this.gameMap = _.map(gameStart, _.clone);

    this.startGame = this.startGame.bind(this);
    this.startNeuralNetGame = this.startNeuralNetGame.bind(this);
    this.increaseSpeed = this.increaseSpeed.bind(this)
    this.decreaseSpeed = this.decreaseSpeed.bind(this)
    this.nn = new NeuralNode(2);
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
    if (this.state.game[0].length > 1) {
      if (this.state.score > gameStart[0].length) {
        return this.setState({gameOver:true});
      }
      let game = this.state.game;
      let jumping = 0;
      // if you are already in the air, stay there
      if (this.state.jumping === 1) {
        jumping = 2;
      }
      game[0].splice(0, 1);
      game[1].splice(0, 1);
      this.setState({game, jumping, score: this.state.score + 1});
      
      if (this.isGameOver(game, this.state.jumping)) {
        this.setState({gameOver:true, topScore: this.state.score});
      } else {
        setTimeout(this.incrementGame.bind(this), this.state.speed);
      }
    } else {
      this.setState({gameOver:true, wonGame: true, topScore: this.state.score});
    }
  }


  incrementGameNN2() {
    if (this.state.game[0].length > 1) {
      if (this.state.score > gameStart[0].length) {
        return this.setState({gameOver:true});
      }
      let game = this.state.game;

      game[0].splice(0, 1);
      game[1].splice(0, 1);
      
      let jumping = 0;
      // if you are already in the air, stay there
      if (this.state.jumping === 1) {
        jumping = 2;
      } else if (this.state.jumping === 0) {
        jumping = this.nn.shouldJump(game[0][1], game[1][1]) ? 1 : 0;
      }
      console.log("jumping: " + jumping);

      this.setState({game, jumping, score: this.state.score + 1});
      



      if (this.isGameOver(game, this.state.jumping)) {

        this.nn.train(game[0][0], game[1][0], game[0][0]) === 1 ? 1 : 0;
        
        console.log('game over');
        this.resetGameNN();
      } else {
        setTimeout(this.incrementGameNN2.bind(this), this.state.speed);
      }
    } else {
      this.resetGameNN();
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
    }, this.incrementGameNN2);
  }


  // incrementGameNN2() {
  //   if (this.state.game[0].length > 1) {
  //     if (this.state.score > gameStart[0].length) {
  //       return this.setState({gameOver:true});
  //     }
  //     let game = this.state.game;
  //     let jumping = 0;
  //     // if you are already in the air, stay there
  //     if (this.state.jumping === 1) {
  //       jumping = 2;
  //     }
  //     game[0].splice(0, 1);
  //     game[1].splice(0, 1);
  //     this.setState({game, jumping, score: this.state.score + 1});
      
  //     if (this.isGameOver(game, this.state.jumping)) {
  //       this.setState({gameOver:true, topScore: this.state.score});
  //     } else {
  //       setTimeout(this.incrementGame.bind(this), this.state.speed);
  //     }
  //   } else {
  //     this.setState({gameOver:true, wonGame: true, topScore: this.state.score});
  //   }
  // }


  incrementGameNN() {
    let game = this.state.game;

    game[0].splice(0, 1);
    game[1].splice(0, 1);
    let score = this.state.score + 1;


    if (score === gameStart[0].length) {
      console.log('game won)');
      return this.resetGameNN();
    }

    const i1 = game[0][1];
    const i2 = game[1][1];
    
    let jump;
    if (jump === 1) {
      jump = 2;
    } else if (this.state.jumping === 2) {
      jump = 0;
      console.log("ending jump")
    } else if (this.state.jumping === 0) {
      console.log("checking if should jump");
      jump = this.nn.shouldJump([i1, i2]) ? 1 : 0;
    }
    console.log("jump = " + jump)
    
    const gameOver = this.isGameOver(game, jump);

    this.setState({game, score, jump});


    if (gameOver) {
      let expectedOutput;
      if (jump === 0) {
        expectedOutput = 1;
      } else {
        expectedOutput = 0;
      }

      this.nn.train([i1, i2], expectedOutput);
      
      console.log('game over');
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
      jumping: 0,
      score: 0,
      neuralNetRunning: false,
      generation: 0
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
          <div className="col-xs-12">
            <p>Press W key to jump.</p>
            <p>Score: {this.state.score}</p>
            <p>Top Score: {this.state.topScore}</p>
            <p>Weights:
            <textarea class="form-control" id="exampleFormControlTextarea1" rows="20">{JSON.stringify(this.nn.weights, null, 2)}</textarea></p>
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
        {!this.state.gameOver && !this.state.neuralNetRunning && <div className="row">
          <div className="col-xs-12">
            <h2>Frogging it up!</h2>
          </div>
        </div>}
        <div className="row">
          <div className="col-xs-12">
            <RenderGame game={this.state.game}/>
            <div className="row">
              <div className="col-xs-1">
                <div className={this.state.jumping != 0 ? 'player jumping' : 'player'}><FontAwesomeIcon size='3x' icon={faFrog} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
