import * as c from '../constants.js'
import {Neuron} from './neuron'

export class Layer {
  constructor(kind){
    this.kind = kind
    this.neurons = []
  }

  addNeurons(n){
    for (var i = 0; i < n; i++) {
      this.neurons.push(new Neuron().setKind(this.kind))
    }
    return this;
  }

  addInput(x) {
    this.neurons.push(new Neuron().setKind(c.TYPE_INPUT).setOutput(x))
    return this;
  }

  setInput(i, x) {
    this.neurons[i].setOutput(x)
  }

  connect(prev_layer, connection) {
    if (connection === c.CONN_FULLY_CONNECTED){
      this.neurons.forEach(function(n, i){
        prev_layer.neurons.forEach(function(pn, j) {
          n.addInput(pn)
        }, this)
      }, this)
    }
    return this;
  }

  randomize(a) {
    if(this.kind != c.TYPE_INPUT){
      this.neurons.forEach(function(n, i){
        n.randomize(a)
      })
    }
    return this;
  }

  activate() {
    this.neurons.forEach(function(n, i){
      n.activate()
    })
  }

}
