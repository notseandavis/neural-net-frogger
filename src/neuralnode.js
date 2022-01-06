import _ from 'lodash';

export default class NeuralNode {
    
    constructor(nInputs) {
        this.weights = this.generateInputs(nInputs);
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
        });
        return weights;
    }


    sigmoid = x => 1 / (1 + Math.exp(-x));

    sigmoidDerivative(x) {
        const fx = this.sigmoid(x);
        return fx * (1 - fx);
    }
    
    applyTrainUpdate(weightDeltas) {
        _.each(weightDeltas.o.weights, (w, i) => {
             this.weights.o.weights[i] += w;
        }) 
        this.weights.o.bias += weightDeltas.o.bias

        _.each(weightDeltas.i, (input, i) => {
            _.each(input.weights, (weight, ii) => {
                this.weights.i[i].weights[ii] += weight
            })
            this.weights.i[i].bias += input.bias
        })
        console.log(JSON.stringify(this.weights, null, 2));
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
                total += thisWeight * input;
            })
            
            total += this.weights.i[i].bias;
            inputTotals.push(total);
            let sTotal = this.sigmoid(total);
            sInputTotals.push(sTotal);
        })

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out = out + this.weights.o.weights[i] * thisTotal
        })
        let sOut = this.sigmoid(out);

        //learning starts here:
        // we calculate our delta
        var delta = expectedOutput - sOut;
        //console.log('delta: ' + delta);
        //then we calculate our derivative (and throwing away "2 * " as we can multiply it later)
        var o1_delta = delta * this.sigmoidDerivative(out);

        //and for our equatation w1 * h1 + w2 * h2 we're trying to alter weights first
        
        _.times(inputs.length, i => {
            weightDelta.o.weights[i] += sInputTotals[i] * o1_delta

            const thisDelta = o1_delta * this.sigmoidDerivative(inputTotals[i])
            _.each(inputs, (input, ii) => {
                weightDelta.i[i].weights[ii] += input * thisDelta
            })
            weightDelta.i[i].bias += o1_delta

        })
        weightDelta.o.bias += o1_delta;

        return this.applyTrainUpdate(weightDelta);
    }
    
    nn(inputs) {
        let inputTotals = []
        
        _.each(inputs, (input, i) => {
            let total = 0;
            let thisWeights = this.weights.i[i].weights;

            _.each(thisWeights, (thisWeight, ii) => {
                total += thisWeight * input;
            })
            
            total += this.weights.i[i].bias;
            let sTotal = this.sigmoid(total);
            inputTotals.push(sTotal);
        })

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out += this.weights.o.weights[i] * thisTotal
        })
        out += this.weights.o.bias;
        let sOut = this.sigmoid(out);

        return sOut;
    }

    // inputs: [number, number]
    // think(inputs) {
    //     const i = math.matrix(inputs);
    //     const sw = math.matrix(this.synapticWeights);
    //     const transposedSw = math.transpose(sw);

    //     console.log(math.size(i));
    //     console.log(math.size(transposedSw));


    //     const multiplied = math.multiply(transposedSw, i); //this.multiplyMatrices(inputs, this.synapticWeights);

    //     const rtn = this.sigmoid(multiplied);
        
    //     return rtn;
    // }
    
    shouldJump = function(a, b) {
        const decision = this.nn(a, b);
        console.log(decision);
        const shouldJump = decision > 0.7;

        

        return shouldJump;
    }
}

