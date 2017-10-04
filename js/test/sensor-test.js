var s = require('../sensor')
var f = require('../food')
var bp = require('../snake')
var assert = require('assert');

describe('Sensor', function() {
  bodyPart = new bp.BodyPart({x: 0, y: 0}, 0)
  sensor = new s.Sensor(0, 10)
  world = {
    food: [
      new f.Food({x:10, y: 0}, 10),
      new f.Food({x:0, y: 10}, 10),
      new f.Food({x:0, y: -10}, 10),
      new f.Food({x:-10, y: 0}, 10),
    ]
  }
  describe('#distance(pos)', function() {
    it('should return 1 from x=0 to x=1', function() {
      assert.equal(1, sensor.distance({x: 1, y:0}));
    });
  });
  describe('#scan(world)', function() {
    it('should return bigger than 0', function() {
      sensor.scan(world)
      assert.equal(true, sensor.excitement > 0, "Excitement: " + sensor.excitement)
    });
    it('should return 0', function() {
      new_sensor = new s.Sensor(0, 10).setMountPoint({x: 15, y: 15}).setDirection(90)
      new_sensor.scan(world)
      assert.equal(0, new_sensor.excitement, "Excitement: " + new_sensor.excitement)
    });
  });
  describe('#_isOnSight(pos)', function() {
    it('can see {x:10, y:0} from (0, 0) and 10deg vission wide', function() {
      assert.equal(true, sensor._isOnSight({x: 10, y: 0}))
    });
    it('can NOT see {x:10, y:10} from (0, 0) and 10deg vission wide', function() {
      assert.equal(false, sensor._isOnSight({x: 10, y: 10}))
    });
    it('can NOT see {x:-10, y:0} from (0, 0) and 10deg vission wide', function() {
      assert.equal(false, sensor._isOnSight({x: 10, y: 10}))
    });
    it('can see {x:0, y:10} from (10, 10) and 10deg vission with direction=180deg', function() {
      new_sensor = new s.Sensor(0, 10).setMountPoint({x: 10, y: 10}).setDirection(180)
      assert.equal(true, new_sensor._isOnSight({x: 0, y: 10}))
    });
    it('can see {x:0, y:0} from (400, 400) and 10deg vission with direction=225deg', function() {
      new_sensor = new s.Sensor(new bp.BodyPart({x: 400, y: 400}, 225), 0, 0, 10)
      assert.equal(true, new_sensor._isOnSight({x: 0, y: 0}))
    })
    it('can see {x:495, y:255} from (506, 333) and 30deg vission with direction=255', function() {
      new_sensor = new s.Sensor(new bp.BodyPart({x: 506, y: 333}, 255), 0, 0, 30)
      assert.equal(true, new_sensor._isOnSight({x: 495, y: 255}))
    })
  })
});
