import * as c from '../constants.js'
import {Neuron} from './neuron'

export class Layer {
  constructor(kind){
    this.kind = kind
    this.neurons = []
  }

  static reproduce(l1, l2, prob_n1, prob_mut){
    let child_layer = new Layer(l1.kind)
    for(let i = 0; i < l1.neurons.length; i++){
      child_layer.neurons.push(Neuron.reproduce(l1.neurons[i], l2.neurons[i], prob_n1, prob_mut))
    }
    return child_layer
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
