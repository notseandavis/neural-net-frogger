export default class NeuralNet {

    constructor(nInputs) {
        this.weights = this.generateWeightsObject(nInputs);
    }

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
    generateWeightsObject(nInputs) {
        let weights = {
            bias_o1: 0
        };
        for (let i = 0; i < nInputs; i++) {
            weights["i" + i + "_h" + i] = 0;
            for (let ii = 0; ii < nInputs; ii++) {
                if (i !== ii)
                    weights["i" + i + "_h" + ii] = 0;
            }
            weights["bias_h" + i] = 0;
            weights["h" + i + "_o1"] = 0;
        }
        return weights;
    }
    
    sigmoid = x => 1 / (1 + Math.exp(-x));

    sigmoidDerivative(x) {
        const fx = this.sigmoid(x);
        return fx * (1 - fx);
    }
    
    applyTrainUpdate(weight_deltas) {
        Object.keys(this.weights).forEach(key => 
            this.weights[key] += weight_deltas[key]);
    }

    train = function(i1, i2, output) {
        let weightDelta = {
            i1_h1: 0,
            i2_h1: 0,
            bias_h1: 0,
            i1_h2: 0,
            i2_h2: 0,
            bias_h2: 0,
            h1_o1: 0,
            h2_o1: 0,
            bias_o1: 0,
        };

        //this part is 100% identic to forward pass function
        var h1_input =
            this.weights.i1_h1 * i1 +
            this.weights.i2_h1 * i2 +
            this.weights.bias_h1;
        var h1 = this.sigmoid(h1_input);

        var h2_input =
            this.weights.i1_h2 * i1 +
            this.weights.i2_h2 * i2 +
            this.weights.bias_h2;
        var h2 = this.sigmoid(h2_input);


        var o1_input =
            this.weights.h1_o1 * h1 +
            this.weights.h2_o1 * h2 +
            this.weights.bias_o1;

        var o1 = this.sigmoid(o1_input);

        //learning starts here:
        // we calculate our delta
        var delta = output - o1;
        //console.log('delta: ' + delta);
        //then we calculate our derivative (and throwing away "2 * " as we can multiply it later)
        var o1_delta = delta * this.sigmoidDerivative(o1_input);

        //and for our equatation w1 * h1 + w2 * h2 we're trying to alter weights first
        
        weightDelta.h1_o1 += h1 * o1_delta;
        weightDelta.h2_o1 += h2 * o1_delta;
        weightDelta.bias_o1 += o1_delta;
        
        //and then we're trying to alter our h1 and h2.
        //but we cannot alter them directly, as they are functions of other weights too
        //so we need to alter their weights by same approach 
        
        var h1_delta = o1_delta * this.sigmoidDerivative(h1_input);
        var h2_delta = o1_delta * this.sigmoidDerivative(h2_input);
        
        weightDelta.i1_h1 += i1 * h1_delta;
        weightDelta.i2_h1 += i2 * h1_delta;
        weightDelta.bias_h1 += h1_delta;
        
        weightDelta.i1_h2 += i1 * h2_delta;
        weightDelta.i2_h2 += i2 * h2_delta;
        weightDelta.bias_h2 += h2_delta;

        return this.applyTrainUpdate(weightDelta);
    }
    
    nn(inputs) {

        let thisInput = 0;
        
        let inputs = [];

        _.each(inputs, (input, i) => {
            let total = 0;

            const thisInput = this.weights["i" + i + "_h" + i] * input;

            total = total + thisInput;
            
            
            _.each(inputs, (otherInput, ii) => {
                if (i !== ii) {
                    const anotherInput = this.weights["i" + i + "_h" + i] * otherInput;
                    total = total + anotherInput;
                }
            });

            const thisBias = this.weights["bias_h" + i];

            total = total + thisBias;
            const thisInputResult = this.sigmoid(total);
            inputs.push(thisInputResult);

        });




        let outputTotal = 0;

        const thisInput = this.weights["i" + i + "_h" + i] * input;

        outputTotal = outputTotal + thisInput;
        
        
        _.each(inputs, (otherInput, ii) => {
            if (i !== ii) {
                const anotherInput = this.weights["i" + i + "_h" + i] * otherInput;
                outputTotal = outputTotal + anotherInput;
            }
        });

        const thisBias = this.weights["bias_h" + i];

        outputTotal = outputTotal + thisBias;
        const thisInputResult = this.sigmoid(outputTotal);
        inputs.push(thisInputResult);



        for (let i = 0; i < nInputs; i++) {
            weights["i" + i + "_h" + i] = 0;



            for (let ii = 0; ii < nInputs; ii++) {
                if (i !== ii)
                    weights["i" + i + "_h" + ii] = 0;
            }
            weights["bias_h" + i] = 0;
        }

        var h1_input =
            this.weights.i1_h1 * i1 +
            this.weights.i2_h1 * i2 +
            this.weights.bias_h1;
        var h1 = this.sigmoid(h1_input);
    
        var h2_input =
            this.weights.i1_h2 * i1 +
            this.weights.i2_h2 * i2 +
            this.weights.bias_h2;
        var h2 = this.sigmoid(h2_input);
    
    
        var o1_input =
            this.weights.h1_o1 * h1 +
            this.weights.h2_o1 * h2 +
            this.weights.bias_o1;
    
        var o1 = this.sigmoid(o1_input);
        
        return o1;
    }
    
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

