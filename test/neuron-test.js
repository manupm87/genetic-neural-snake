import * as c from '../src/constants.js'
import {Neuron} from '../src/neural/neuron'
import assert from 'assert'

describe('Neuron', function() {

  describe('#sigmoid(x)', function() {
    it('should return 0,5 for x = 0', function() {
      assert.equal(0.5, Neuron.sigmoid(0));
    });
    it('should return almost 0 for x = -6', function() {
      assert.equal(true, 0.01 > Neuron.sigmoid(-6));
    })
    it('should return almost 1 for x = 6', function() {
      assert.equal(true, 0.99 < Neuron.sigmoid(6));
    })
  });

  describe('#activate()', function() {
    it('should return 1 if the output of an INPUT neuron is 1', function() {
      assert.equal(1, new Neuron().setOutput(1).activate().output)
    })
    it('should return a value between 0 and 1 for a neuron in a hidden layer with 2 inputs', function() {
      let neuron_in_a = new Neuron().randomize().setOutput(0.5)
      let neuron_in_b = new Neuron().randomize().setOutput(-0.5)
      let neuron = new Neuron().setKind(c.TYPE_HIDDEN)
      neuron.addInput(neuron_in_a).addInput(neuron_in_b).randomize(10).activate()
      assert.equal(true, 0 < neuron.output && neuron.output < 1)
    })
  })

  describe('#randomize(a)', function() {
    it('mean of weights and bias between -10 and 10 and not 0', function() {
      let neuron = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron())
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

  describe('#reproduce(n1, n2, prob_n1, prob_mut)', function() {
    it('should return a similar neuron from 2 equal neurons', function() {
      let n1 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron())
      let n2 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron())
      let child_neuron = Neuron.reproduce(n1, n2, 0.5, 0)
      assert.deepEqual(n1.weights, child_neuron.weights)
      assert.equal(n1.bias, child_neuron.bias)
    })
    it('should return a different neuron from 2 different neurons', function() {
      let n1 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).randomize(10)
      let n2 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).randomize(10)
      let child_neuron = Neuron.reproduce(n1, n2, 0.5, 0)
      assert.notDeepEqual(n1.weights, child_neuron.weights)
      // assert.notEqual(n1.bias, child_neuron.bias)
    })
    it('should return a different neuron from 2 equal neurons when 100% chance of mutation', function() {
      let n1 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron())
      let n2 = new Neuron().setKind(c.TYPE_HIDDEN).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron()).addInput(new Neuron())
      let child_neuron = Neuron.reproduce(n1, n2, 0.5, 1)
      assert.notDeepEqual(n1.weights, child_neuron.weights)
      // assert.notEqual(n1.bias, child_neuron.bias)
    })
  })

  describe('#_function_()', function() {
    it('_message_', function() {
      assert.equal(0,0)
    })
  })



});
