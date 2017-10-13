import * as c from '../constants'

export class Neuron {
  constructor(){
    this.kind = c.TYPE_INPUT
    this.bias = 0
    this.activ_f = c.AF_SIGMOID
    this.weights = []
    this.inputs = []
    this.output = 0
  }

  static reproduce(n1, n2, prob_n1, prob_mut){
    let child = new Neuron()
    child.setKind(n1.kind)
    child.bias = Math.random() < prob_n1 ? n1.bias : n2.bias
    for (let i = 0; i < n1.weights.length; i++) {
      if (Math.random() < prob_mut){
        child.weights.push(10 * Math.random())
      }
      else {
        child.weights.push(Math.random() < prob_n1 ? n1.weights[i] : n2.weights[i])
      }
    }
    return child
  }

  setOutput(y){
    this.output = y
    return this;
  }

  setKind(k){
    this.kind = k
    return this
  }

  activate(){
    if (this.kind === c.TYPE_INPUT){
      return this;
    }
    let pre_output = this.bias
    this.weights.forEach(function(w, i){
      pre_output += this.inputs[i].output * w
    }, this)
    this.output = Neuron.sigmoid(pre_output)
    return this;
  }

  static sigmoid(x){
    return 1 / (1 + Math.exp(-x))
  }

  addInput(neuron){
    this.inputs.push(neuron)
    if (this.inputs.length > this.weights.length){
      this.weights.push(1)
    }
    return this;
  }

  randomize(a){
    if(this.kind != c.TYPE_INPUT){
      this.weights.forEach(function(w,i){
        this.weights[i] = -a + 2 * a * Math.random()
      }, this)

      this.bias = -a + 2 * a * Math.random()
    }
    return this;
  }

}
