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

  describe('#_function_()', function() {
    it('_message_', function() {
      assert.equal(0,0)
    })
  })
})
