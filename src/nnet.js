import { forEach } from "mathjs/lib/type";

export default class NNEt {
    constructor(inputs, numberOfNodes, numberOfLayers) {
        // if (numberOfNodes < inputs) {
        //     throw new Error("nodes must be equal or larger than inputs")
        // }
        // number of inputs
        this.inputs = inputs;
        this.numberOfNodes = numberOfNodes;
        this.numberOfLayers = numberOfLayers;
        // horizontal layers
        this.layers = [];
        
        let i = 0;
        while (this.layers.length < numberOfLayers) {
            this.layers.push([]);
            if (i == 0) {
                // input layer
                while (this.layers[i].length < inputs) {
                    this.layers[i].push(new Node(this.inputs));
                }
            } else if (i === 1) {
                while (this.layers[i].length < this.numberOfNodes) {
                    // layer on top of input layer, gets the number of input
                    this.layers[i].push(new Node(this.inputs)); 
                }
            } else {
                // middle layer
                while (this.layers[i].length < this.numberOfNodes) {
                    // layer on top of input layer, gets the number of input
                    this.layers[i].push(new Node(this.numberOfNodes)); 
                }
            }
            i++;
        }
        // output layer
        this.layers.push([]);
        this.layers[i].push(new Node(this.numberOfLayers == 1 ? this.inputs : this.numberOfNodes)); 
    }
    inputs = 0
    // nodes live inside a layer
    layers = []
    
    // todo make this recursive
    train(inputs, expectedOutput) {
        let allOutputs = this.activateAllLayers(inputs);
        
        // start with the delta of the output node
        let previousLayersDeltas = Array.apply(null, Array(this.layers.length)).map(function () { return []; });
        // get the delta from the bottom layer, 
        // and walk backwards through the layers
        let i = (this.layers.length - 1);
        while( i >= 0) {
            for (let ii = (this.layers[i].length - 1); ii >= 0; ii--) {
                // this layer's input is the previous layer's output, or the original input
                let thisLayersInput = i === 0 ? inputs : allOutputs[i - 1];
                let thisLayersDelta;
                if (i === this.layers.length - 1) {
                    // this is the output layer
                    let outputDelta = (expectedOutput - allOutputs[i][0])
                    thisLayersDelta = outputDelta;
                    console.log("training output layer")
                } else if (i === this.layers.length - 2) {
                    // this is the layer on top of the output layer, there is only one node on this layer
                    thisLayersDelta = previousLayersDeltas[i + 1][0]
                    console.log("training layer on top of output layer")
                } else {
                    // this is some middle or output layer, add up the previous layers together as they all connect together
                    thisLayersDelta = 0;
                    previousLayersDeltas[i + 1].forEach(delta => { thisLayersDelta += delta; });
                    console.log("training middle or top layer");
                }
                let nextLayersDelta = this.layers[i][ii].train(thisLayersInput, thisLayersDelta);
                previousLayersDeltas[i].push(nextLayersDelta)
            }
            i--;
        }
    }

    activateAllLayers(inputs) {
        let layerInputs = inputs;
        let layerOutputs = [];
        this.layers.forEach((layer, i) => {
            layerOutputs.push([]);
            layer.forEach((node, ii) => {
                layerOutputs[i].push(node.fire(layerInputs));
            });
            // inputs for the next layer are outputs from this layer
            layerInputs = layerOutputs[i];
        });
        // final layer has only one output
        return layerOutputs;
    }
    fire(inputs) {
        let allOutputs = this.activateAllLayers(inputs);

        // return the final output layer
        return allOutputs[this.layers.length - 1][0]
    }
}

class Node {
    constructor(inputs) {
        // number of inputs
        this.inputs = inputs;
        // initialize all weights to 0
        this.weights = Array.apply(null, Array(inputs)).map(function () { return 0; })
        this.bias = 0;
    }
    inputs = [];

    train(inputs, correction) {
        let actualOutput = activation(inputs, this.weights, this.bias)

        let delta = (correction * sigmoidDerivative(actualOutput));
        
        for (let i = 0; i < inputs.length; i++) {
            this.weights[i] += inputs[i] * delta;
        }
        this.bias += delta;
        return delta;
    }
    fire(inputs) {
        if (inputs.length > this.weights.length) {
            throw new Error("too many inputs");
        }
        let sum = activation(inputs, this.weights, this.bias)
        return sigmoid(sum)
    }
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
} 
function sigmoidDerivative(x) {
    const fx = sigmoid(x);
    return fx * (1 - fx);
}

function activation(inputs, weights, bias) {
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
        sum += weights[i] * inputs[i]
    }
    return sum += bias;
}
// class MathHelper {
//     sigmoid(x) {
//         return 1 / (1 + Math.exp(-x));
//     } 
//     sigmoidDerivative(x) {
//         const fx = MathHelper.sigmoid(x);
//         return fx * (1 - fx);
//     }
    
//     activation(inputs, weights, bias) {
//         let sum = 0;
//         for (let i = 0; i < inputs.length; i++) {
//             sum += weights[i] * inputs[i]
//         }
//         return sum += bias;
//     }
// }