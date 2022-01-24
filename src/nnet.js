import { forEach } from "mathjs/lib/type";

export default class NNEt {
    constructor(inputs, numberOfNodes, numberOfLayers) {
        // number of inputs
        this.inputs = inputs;
        this.numberOfNodes = numberOfNodes;
        // horizontal layers
        this.layers = [];
        
        let i = 0;
        while (this.layers.length < numberOfLayers) {
            let ii = 0;
            this.layers.push([]);
            while (this.layers[i].length < numberOfNodes) {
                if (i === 0) {
                    // first layer
                    this.layers[i].push(new Node(inputs));
                } else {
                    // middle layer
                    this.layers[i].push(new Node(numberOfNodes));
                }
            }
        }
        // output layer
        this.layers.push([new Node(numberOfNodes)]);
    }
    inputs = 0
    // nodes live inside a layer
    layers = []

    // todo make this recursive
    train(inputs, expectedOutput) {
        let allOutputs = this.activateAllLayers(inputs);

        // start with the delta of the output node
        let outputDelta = (expectedOutput - allOutputs[this.layers.length - 1][0])
        let previousLayersDeltas = Array.apply(null, Array(this.layers.length)).map(function () { return []; });
        // get the delta from the bottom layer, 
        // and walk backwards through the layers
        let i = (this.layers.length - 1);
        while( i >= 0) {
            for (let ii = (this.layers[i].length - 1); ii >= 0; ii--) {
                // this layer's input is the previous layer's output, or the original input
                let thisLayersInput = i > 0 ? allOutputs[i - 1] : inputs;
                let thisLayersDelta;
                if (i === this.layers.length - 1) {
                    // this is the output layer
                    thisLayersDelta = outputDelta;
                } else if (i === this.layers.length - 2) {
                    // this is the layer on top of the output layer
                    thisLayersDelta = previousLayersDeltas[previousLayersDeltas.length - 1][0]
                } else {
                    // this is some other layer
                    thisLayersDelta = previousLayersDeltas[previousLayersDeltas.length - 1][ii]
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
            layer.forEach((node) => {
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