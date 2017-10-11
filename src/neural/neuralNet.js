var l = require('./layer')

CONN_FULLY_CONNECTED = 0
AF_SIGMOID = 0
AF_RELU = 1
AF_TANH = 2

TYPE_INPUT = 0
TYPE_HIDDEN = 1
TYPE_OUTPUT = 2

class NeuralNet {
  constructor(){
    this.inputLayer = new l.Layer(TYPE_INPUT)
    this.hiddenLayers = []
    this.outputLayer = null
    this.output = null
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
    let hl = new l.Layer(TYPE_HIDDEN)
    hl.addNeurons(n)
    //console.log(hl)
    this.hiddenLayers.push(hl)
    if (this.hiddenLayers.length == 1){
      this.hiddenLayers[0].connect(this.inputLayer, CONN_FULLY_CONNECTED)
    }
    else {
      this.hiddenLayers[this.hiddenLayers.length - 1].connect(this.hiddenLayers[this.hiddenLayers.length - 2], CONN_FULLY_CONNECTED)
    }
    //console.log(hl)
    return this;
  }

  addOutputLayer(n) {
    this.outputLayer = new l.Layer(TYPE_OUTPUT).addNeurons(n)
    if (this.hiddenLayers.length == 0){
      this.outputLayer.connect(this.inputLayer, CONN_FULLY_CONNECTED)
    }
    else {
      this.outputLayer.connect(this.hiddenLayers[this.hiddenLayers.length - 1], CONN_FULLY_CONNECTED)
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
    this.outputLayer.activate()
    this.outputLayer.neurons.forEach(function(neuron, i){
      this.output[i] = neuron.output
    }, this)
    return this;
  }
}

module.exports = {
    NeuralNet: NeuralNet
};
