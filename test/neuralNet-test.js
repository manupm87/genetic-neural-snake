import {NeuralNet} from '../src/neural/neuralNet.js'
import assert from 'assert'

describe('NeuralNet', function() {

  describe('#activate()', function() {
    it('should return an output > 0.5 for a simple neural net with 2 inputs of value 0.5 and 1 output', function() {
      let neural_net = new NeuralNet()
      neural_net.addInput(0.5).addInput(0.5)
      neural_net.addOutputLayer(1)
      neural_net.activate()
      assert.equal(true, 0.5 < neural_net.output[0])
    })

    it('should return an output < 0.5 for a simple neural net with 2 inputs of value 0.5 and 1 output', function() {
      let neural_net = new NeuralNet()
      neural_net.addInput(0.5).addInput(0.5)
      neural_net.setInput(0, -0.5).setInput(1, -0.5)
      neural_net.addOutputLayer(1)
      neural_net.activate()
      assert.equal(true, 0.5 > neural_net.output[0])
    })

    it('should return an output between 0 and 1 for a deep neural net with 2 inputs, 1 hiddenLayers of 3 neurons, and 1 output', function() {
      let neural_net = new NeuralNet()
      neural_net.addInput(0.5).addInput(0.5)
      neural_net.addHiddenLayer(3)
      neural_net.addOutputLayer(1)
      neural_net.randomize(10)
      neural_net.activate()
      assert.equal(true, 0 < neural_net.output[0] && 1 > neural_net.output[0])
    })

    it('should return an output between 0 and 1 for a deep neural net with 2 inputs, 3 hiddenLayers of [3, 10, 3] neurons, and 2 outputs', function() {
      let neural_net = new NeuralNet()
      neural_net.addInput(0.5).addInput(0.5)
      neural_net.addHiddenLayer(3)
      neural_net.addHiddenLayer(10)
      neural_net.addHiddenLayer(3)
      neural_net.addOutputLayer(2)
      neural_net.randomize(10)
      neural_net.activate()
      assert.equal(true, 0 < neural_net.output[0] && 1 > neural_net.output[0])
    })
  })

  describe('#reproduce(n1, n2, prob_n1, prob_mut)', function() {
    it('sould produce a similar net from 2 identical nets', function() {
      let neural_net1 = new NeuralNet()
      neural_net1.addInput(0.5).addInput(0.5)
      neural_net1.addOutputLayer(1)
      neural_net1.activate()
      let neural_net2 = new NeuralNet()
      neural_net2.addInput(0.5).addInput(0.5)
      neural_net2.addOutputLayer(1)
      neural_net2.activate()

      let child_net = NeuralNet.reproduce(neural_net1, neural_net2, 0.5, 0)
      child_net.activate()
      assert.deepEqual(neural_net1, child_net)
    })
    it('sould produce a similar net from 2 identical nets with hidden layers', function() {
      let neural_net1 = new NeuralNet()
      neural_net1.addInput(0.5).addInput(0.5)
      neural_net1.addHiddenLayer(3)
      neural_net1.addHiddenLayer(10)
      neural_net1.addHiddenLayer(3)
      neural_net1.addOutputLayer(1)
      neural_net1.activate()
      let neural_net2 = new NeuralNet()
      neural_net2.addInput(0.5).addInput(0.5)
      neural_net2.addHiddenLayer(3)
      neural_net2.addHiddenLayer(10)
      neural_net2.addHiddenLayer(3)
      neural_net2.addOutputLayer(1)
      neural_net2.activate()

      let child_net = NeuralNet.reproduce(neural_net1, neural_net2, 0.5, 0)
      child_net.activate()
      assert.deepEqual(neural_net1, child_net)
    })
    it('sould produce a different net from 2 identical nets with mutation 100%', function() {
      let neural_net1 = new NeuralNet()
      neural_net1.addInput(0.5).addInput(0.5)
      neural_net1.addOutputLayer(1)
      neural_net1.activate()
      let neural_net2 = new NeuralNet()
      neural_net2.addInput(0.5).addInput(0.5)
      neural_net2.addOutputLayer(1)
      neural_net2.activate()

      let child_net = NeuralNet.reproduce(neural_net1, neural_net2, 0.5, 100)
      child_net.activate()
      assert.notDeepEqual(neural_net1, child_net)
    })
  })

  describe('#_function_()', function() {
    it('_message_', function() {
      assert.equal(0,0)
    })
  })
})
