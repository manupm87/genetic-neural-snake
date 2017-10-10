class Neuron {
  constructor(){
    this.kind = TYPE_INPUT
    this.bias = 0
    this.activ_f = AF_SIGMOID
    this.weights = []
    this.inputs = []
    this.output = 0
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
    if (this.kind === TYPE_INPUT){
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
    this.weights.push(1)
    return this;
  }

  randomize(a){
    if(this.kind != TYPE_INPUT){
      this.weights.forEach(function(w,i){
        this.weights[i] = -a + 2 * a * Math.random()
      }, this)

      this.bias = -a + 2 * a * Math.random()
    }
    return this;
  }

}

module.exports = {
  Neuron: Neuron
}
