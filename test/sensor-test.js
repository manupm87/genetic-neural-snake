import {Sensor} from '../src/sensor'
import * as c from '../src/constants'
var f = require('../src/food')
var bp = require('../src/snake')
var assert = require('assert');

describe('Sensor', function() {
  let bodyPart = new bp.BodyPart({x: 0, y: 0}, 0)
  let sensor = new Sensor(new bp.BodyPart({x: 100, y: 100}, 0), 0, c.KIND_FOOD, 10)
  let world = {
    food: [
      new f.Food({x:100, y: 150}, 10),
      new f.Food({x:100, y: 50}, 10),
      new f.Food({x:50, y: 100}, 10),
      new f.Food({x:150, y: 100}, 10),
    ]
  }
  describe('#distance(pos)', function() {
    it('should return 100 from x=100 to x=200', function() {
      assert.equal(100, sensor.distance({x: 200, y:100}));
    });
  });
  describe('#scan(world) | FOOD', function() {
    it('should return bigger than 0', function() {
      sensor.scan(world)
      assert.equal(true, sensor.excitement > 0, "Excitement: " + sensor.excitement)
    });
    it('should return 0', function() {
      // new_sensor = new s.Sensor(0, 10).setMountPoint({x: 15, y: 15}).setDirection(90)
      let new_sensor = new Sensor(new bp.BodyPart({x: 15, y: 15}, 90), 90, c.KIND_FOOD, 10)
      new_sensor.scan(world)
      assert.equal(0, new_sensor.excitement, "Excitement: " + new_sensor.excitement)
    });
  });

  describe('#scan(world) | WALLS', function() {
    it('should return bigger than 0', function() {
      let sen = new Sensor(new bp.BodyPart({x: 15, y: 15}, 90), 90, c.KIND_WALL, 10)
      sen.scan(world)
      assert.equal(true, sen.excitement > 0, "Excitement: " + sen.excitement)
    });
  });

  describe('#_isOnSight(pos)', function() {
    it('can see {x:100, y:50} from (50, 50) and 10deg vission wide', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 50, y: 50}, 0), 0, c.KIND_FOOD, 10)
      assert.equal(true, new_sensor._isOnSight({x: 100, y: 50}))
    });
    it('can NOT see {x:10, y:10} from (0, 0) and 10deg vission wide', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 0, y: 0}, 0), 0, c.KIND_FOOD, 10)
      assert.equal(false, new_sensor._isOnSight({x: 10, y: 10}))
    });
    it('can NOT see {x:-10, y:0} from (0, 0) and 10deg vission wide', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 0, y: 0}, 0), 0, c.KIND_FOOD, 10)
      assert.equal(false, new_sensor._isOnSight({x: -10, y: 0}))
    });
    it('can see {x:0, y:10} from (10, 10) and 10deg vission with direction=180deg', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 10, y: 10}, 180), 0, c.KIND_FOOD, 10)
      assert.equal(true, new_sensor._isOnSight({x: 0, y: 10}))
    });
    it('can see {x:0, y:0} from (400, 400) and 10deg vission with direction=225deg', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 400, y: 400}, 225), 0, 0, 10)
      assert.equal(true, new_sensor._isOnSight({x: 0, y: 0}))
    })
    it('can see {x:495, y:255} from (506, 333) and 30deg vission with direction=255', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 506, y: 333}, 255), 0, 0, 30)
      assert.equal(true, new_sensor._isOnSight({x: 495, y: 255}))
    })
  })
  describe('#getDistanceToWall(wall)', function() {
    it('should be 100 from x= 100, y = 200 to LEFT wall with the sensor looking to 180', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 100, y: 200}, 180), 0, 0, 10)
      assert.equal(100.0, new_sensor.getDistanceToWall('left'))
    })
    it('should be 100 from x= WORLD_WIDTH - 100, y = 200 to RIGHT wall with the sensor looking to 0', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: c.WORLD_WIDTH - 100, y: 200}, 0), 0, 0, 10)
      assert.equal(100.0, new_sensor.getDistanceToWall('right'))
    })
    it('should be 100 from x= 100, y = 100 to TOP wall with the sensor looking to -90', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 100, y: 100}, -90), 0, 0, 10)
      assert.equal(100.0, new_sensor.getDistanceToWall('top'))
    })
    it('should be 100 from x= 100, y = 100 to TOP wall with the sensor looking to 270', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 100, y: 100}, 270), 0, 0, 10)
      assert.equal(100.0, new_sensor.getDistanceToWall('top'))
    })
    it('should be 100 from x= 100, y = WORLD_HEIGHT - 100 to BOTTOM wall with the sensor looking to 90', function() {
      let new_sensor = new Sensor(new bp.BodyPart({x: 100, y: c.WORLD_HEIGHT - 100}, 90), 0, 0, 10)
      assert.equal(100.0, new_sensor.getDistanceToWall('bottom'))
    })
  })
});
