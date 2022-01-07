import _ from 'lodash';
import {add, multiply} from 'mathjs';

export default class NNeuralNodes {
    
    constructor(nInputs, weights) {
        if (!weights) {
            this.weights = this.generateInputs(nInputs);
        }
        else this.weights = weights;
    }
    weights = []
    
    generateInput(n, thisN) {
        let input = {
            bias: 0,
            weights: []
        };
        _.times(n, i => {
            input.weights.push(0);
        })
        return input;
    }

    generateInputs(n) {
        let weights = {
            o: {
                bias: 0,
                weights: []
            },
            i: []
        }
        _.times(n, i => {
            weights.i.push(this.generateInput(n, i))

            weights.o.weights.push(0)
        })
        return weights;
    }


    sigmoid = x => 1 / (1 + Math.exp(-x));

    sigmoidDerivative(x) {
        const fx = this.sigmoid(x);
        return fx * (1 - fx);
    }
    
    applyTrainUpdate(weightDeltas) {
        _.each(weightDeltas.o.weights, (w, i) => {
             this.weights.o.weights[i] = add(this.weights.o.weights[i], w);
        }, this)
        this.weights.o.bias = add(this.weights.o.bias, weightDeltas.o.bias)

        _.each(weightDeltas.i, (input, i) => {
            _.each(input.weights, (weight, ii) => {
                this.weights.i[i].weights[ii] = add(this.weights.i[i].weights[ii], weight)
            }, this)
            this.weights.i[i].bias = add(this.weights.i[i].bias, input.bias)
        }, this)
        return this.weights;
        // console.log(JSON.stringify(this.weights, null, 2));
    }

    train = function(inputs, expectedOutput) {
        let weightDelta = this.generateInputs(inputs.length)

        //this part is 100% identic to forward pass function
        let sInputTotals = []
        let inputTotals = []
        
        _.each(inputs, (input, i) => {
            let total = 0;
            let thisWeights = this.weights.i[i].weights;
            
            _.each(thisWeights, (thisWeight, ii) => {
                total = add(total, multiply(thisWeight, input));
            }, this)
            
            total = add(total, this.weights.i[i].bias);

            inputTotals.push(total);
            let sTotal = this.sigmoid(total);
            sInputTotals.push(sTotal);
        }, this)

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out = add(multiply(out, this.weights.o.weights[i]), thisTotal)
        }, this)
        out = add(out, this.weights.o.bias);
        let sOut = this.sigmoid(out);

        //learning starts here:
        // we calculate our delta
        var delta = expectedOutput - sOut;
        //console.log('delta: ' + delta);
        //then we calculate our derivative (and throwing away "2 * " as we can multiply it later)
        var o1_delta = delta * this.sigmoidDerivative(out);

        //and for our equatation w1 * h1 + w2 * h2 we're trying to alter weights first
        weightDelta.o.bias = add(weightDelta.o.bias, o1_delta);
        _.times(inputs.length, i => {
            weightDelta.o.weights[i] = add(weightDelta.o.weights[i], (multiply(sInputTotals[i], o1_delta)));

            const thisDelta = o1_delta * this.sigmoidDerivative(inputTotals[i])
            _.each(inputs, (input, ii) => {
                weightDelta.i[i].weights[ii] = add(weightDelta.i[i].weights[ii], (multiply(input, thisDelta)));
            }, this)
            weightDelta.i[i].bias = add(weightDelta.i[i].bias, thisDelta)
        }, this)

        return this.applyTrainUpdate(weightDelta);
    }
    
    nn(inputs) {
        let inputTotals = []
        
        _.each(inputs, (input, i) => {
            let total = 0;
            let thisWeights = this.weights.i[i].weights;

            _.each(thisWeights, (thisWeight, ii) => {
                total = add(total, multiply(thisWeight, input));
            }, this)
            
            total = add(total, this.weights.i[i].bias);
            let sTotal = this.sigmoid(total);
            inputTotals.push(sTotal);
        }, this)

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out = multiply(add(out, this.weights.o.weights[i]), thisTotal)
        }, this)
        out = add(out, this.weights.o.bias);
        let sOut = this.sigmoid(out);

        return sOut;
    }
    
    shouldJump = function(a, b) {
        const decision = this.nn(a, b);
        console.log(decision);
        const shouldJump = decision > 0.6;

        return shouldJump;
    }
}

