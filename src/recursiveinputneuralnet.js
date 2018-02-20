export default class NeuralNet {

    weights = {
        i1_h1: 0,
        i2_h1: 0,
        bias_h1: 0,
        i1_h2: 0,
        i2_h2: 0,
        bias_h2: 0,
        h1_o1: 0,
        h2_o1: 0,
        bias_o1: 0
    };

    nWeights = generateInputs
    
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
            weights.i.push(generateInput(n, i))

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
        _.each(weightDelta.o.weights, (w, i) => {
             this.nWeights.o.weights[i] += w;
        }) 
        this.nWeights.o.bias += weightDeltas.o.bias

        _.each(weightDeltas.i, (input, i) => {
            _.each(input.weights, (weight, ii) => {
                this.nWeights.i[i].weights[ii] += weight
            })
            this.nWeights.i[i].bias += input.bias
        }) 

    }

    train = function(inputs, expectedOutput) {
        let weightDelta = this.generateInputs(inputs.length)

        //this part is 100% identic to forward pass function
        let sInputTotals = []
        let inputTotals = []
        
        _.each(inputs, (input, i) => {
            let total = 0;
            let thisWeights = this.nWeights.i[i].weights;

            _.each(thisWeights, (thisWeight, ii) => {
                total = total + thisWeight * input;
            })
            
            total = total + this.nWeights.i[i].bias;
            inputTotals.push(total);
            sTotal = this.sigmoid(total);
            sInputTotals.push(sTotal);
        })

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out = out + this.nWeights.o.weights[i] * thisTotal
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

            let thisDelta = o1_delta * this.sigmoidDerivative(inputTotals)
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
            let thisWeights = this.nWeights.i[i].weights;

            _.each(thisWeights, (thisWeight, ii) => {
                total = total + thisWeight * input;
            })
            
            total = total + this.nWeights.i[i].bias;
            sTotal = this.sigmoid(total);
            inputTotals.push(sTotal);
        })

        let out = 0;

        _.each(inputTotals, (thisTotal, i) => {
            out = out + this.nWeights.o.weights[i] * thisTotal
        })
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

        const shouldJump = decision > 0.9;

        console.log(decision);
        

        return shouldJump;
    }
}


// def think(self, inputs):
// # Pass inputs through our neural network (our single neuron).
// return self.__sigmoid(dot(inputs, self.synaptic_weights))


// def train(self, training_set_inputs, training_set_outputs, number_of_training_iterations):
// for iteration in xrange(number_of_training_iterations):
//     # Pass the training set through our neural network (a single neuron).
//     output = self.think(training_set_inputs)

//     # Calculate the error (The difference between the desired output
//     # and the predicted output).
//     error = training_set_outputs - output

//     # Multiply the error by the input and again by the gradient of the Sigmoid curve.
//     # This means less confident weights are adjusted more.
//     # This means inputs, which are zero, do not cause changes to the weights.
//     adjustment = dot(training_set_inputs.T, error * self.__sigmoid_derivative(output))

//     # Adjust the weights.
//     self.synaptic_weights += adjustment

