import * as c from '../constants.js'
import {Layer} from './layer'

export class NeuralNet {
  constructor(){
    this.inputLayer = new Layer(c.TYPE_INPUT)
    this.hiddenLayers = []
    this.outputLayer = null
    this.output = null
  }

  static reproduce(n1, n2, prob_n1, prob_mut){
    let child_net = new NeuralNet()
    // New input layer
    for (let neuron of n1.inputLayer.neurons) {
      child_net.addInput(neuron.output)
    }
    // Reproduce hidden layers
    for(let i = 0; i< n1.hiddenLayers.length; i++){
      let new_hl = Layer.reproduce(n1.hiddenLayers[i], n2.hiddenLayers[i], prob_n1, prob_mut)
      child_net.hiddenLayers.push(new_hl)
      if(i === 0){
        child_net.hiddenLayers[0].connect(child_net.inputLayer, c.CONN_FULLY_CONNECTED)
      }
      else {
        child_net.hiddenLayers[i].connect(child_net.hiddenLayers[i - 1], c.CONN_FULLY_CONNECTED)
      }
    }

    // Reproduce output layer
    let new_ol = Layer.reproduce(n1.outputLayer, n2.outputLayer, prob_n1, prob_mut)
    child_net.outputLayer = new_ol
    if (child_net.hiddenLayers.length == 0){
      child_net.outputLayer.connect(child_net.inputLayer, c.CONN_FULLY_CONNECTED)
    }
    else {
      child_net.outputLayer.connect(child_net.hiddenLayers[child_net.hiddenLayers.length - 1], c.CONN_FULLY_CONNECTED)
    }

    child_net.output = []
    for (var i = 0; i < child_net.outputLayer.neurons.length; i++) {
      child_net.output.push(0)
    }

    return child_net
  }

  addInput(x) {
    this.inputLayer.addInput(x)
    return this;
  }

  setInput(i, x){
    this.inputLayer.setInput(i, x)
    return this;
  }

  addHiddenLayer(n) {
    //console.log(n)
    let hl = new Layer(c.TYPE_HIDDEN)
    hl.addNeurons(n)
    //console.log(hl)
    this.hiddenLayers.push(hl)
    if (this.hiddenLayers.length == 1){
      this.hiddenLayers[0].connect(this.inputLayer, c.CONN_FULLY_CONNECTED)
    }
    else {
      this.hiddenLayers[this.hiddenLayers.length - 1].connect(this.hiddenLayers[this.hiddenLayers.length - 2], c.CONN_FULLY_CONNECTED)
    }
    //console.log(hl)
    return this;
  }

  addOutputLayer(n) {
    this.outputLayer = new Layer(c.TYPE_OUTPUT).addNeurons(n)
    if (this.hiddenLayers.length == 0){
      this.outputLayer.connect(this.inputLayer, c.CONN_FULLY_CONNECTED)
    }
    else {
      this.outputLayer.connect(this.hiddenLayers[this.hiddenLayers.length - 1], c.CONN_FULLY_CONNECTED)
    }
    this.output = []
    for (var i = 0; i < n; i++) {
      this.output.push(0)
    }
    //console.log(this.outputLayer)
    return this;
  }

  randomize(a) {
    this.hiddenLayers.forEach(function(layer, i){
      layer.randomize(a)
    })
    this.outputLayer.randomize(a)
    return this;
  }

  activate() {
    this.hiddenLayers.forEach(function(layer, i) {
      layer.activate()
    })
    // console.log("child's output layer!!!")
    // console.log(this.outputLayer)
    this.outputLayer.activate()
    this.outputLayer.neurons.forEach(function(neuron, i){
      this.output[i] = neuron.output
    }, this)
    return this;
  }
}
