var n = require('../neural/neuralNet')
var assert = require('assert');

describe('Neuron', function() {

  describe('#sigmoid(x)', function() {
    it('should return 0,5 for x = 0', function() {
      assert.equal(0.5, n.Neuron.sigmoid(0));
    });
    it('should return almost 0 for x = -6', function() {
      assert.equal(true, 0.01 > n.Neuron.sigmoid(-6));
    })
    it('should return almost 1 for x = 6', function() {
      assert.equal(true, 0.99 < n.Neuron.sigmoid(6));
    })
  });

  describe('#activate()', function() {
    it('should return 1 if the output of an INPUT neuron is 1', function() {
      assert.equal(1, new n.Neuron().setOutput(1).activate().output)
    })
    it('should return a value between 0 and 1 for a neuron in a hidden layer with 2 inputs', function() {
      let neuron_in_a = new n.Neuron().randomize().setOutput(0.5)
      let neuron_in_b = new n.Neuron().randomize().setOutput(-0.5)
      let neuron = new n.Neuron().setKind(TYPE_HIDDEN)
      neuron.addInput(neuron_in_a).addInput(neuron_in_b).randomize(10).activate()
      // console.log(neuron.output)
      assert.equal(true, 0 < neuron.output && neuron.output < 1)
    })
  })

  describe('#randomize(a)', function() {
    it('mean of weights and bias between -10 and 10 and not 0', function() {
      let neuron = new n.Neuron().setKind(TYPE_HIDDEN).addInput(new n.Neuron()).addInput(new n.Neuron)
      neuron.randomize(10)
      let mean = 0
      neuron.weights.forEach(function(w, i){
        mean += w
      })
      mean /= neuron.weights.length
      assert.equal(true, (-10 < mean) && (mean < 10) )
      assert.notEqual(0, neuron.bias)
    })
  })

  describe('#_function_()', function() {
    it('_message_', function() {
      assert.equal(0,0)
    })
  })



});
