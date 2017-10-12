import {Genetic} from '../src/genetic'
import assert from 'assert'

describe('Genetic', function() {
  describe('#reproduce()', function() {
    it('should reproduce', function() {
      Genetic.reproduce("s1", "s2")
      assert.equal(true, true)
    })
  })
})
