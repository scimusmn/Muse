function pointStack(maxPnts) {

  var _this = this;
  var points = [];
  var bAver = true;

  //var averDiff = new aveCont();
  var sampsX = new aveCont(10);
  var sampsY = new aveCont(10);

  points.changeAveraging = function(num) {
    if (num < 2) bAver = false;
    else {
      sampsX.changeNumSamps(num);
      sampsY.changeNumSamps(num);
    }
  };

  points.addPoint = function(pnt) {

    if (points.length) {

      if (this.hasMoved(pnt) === true) {

        if (bAver) {

          sampsX.addSample(pnt.x);
          sampsY.addSample(pnt.y);
          points.push({x:sampsX.ave, y:sampsY.ave});

        } else {

          points.push({x:pnt.x, y:pnt.y});

        }

        if (points.length >= maxPnts) {

          // Remove oldest point
          points.splice(0, 1);

        }

        return true;
      }

    } else {
      points.push({x:pnt.x, y:pnt.y});
      return false;
    }

  };

  points.hasMoved = function(pnt) {

    return (Math.abs(pnt.x - points.last().x) > .003 || Math.abs(pnt.y - points.last().y) > .003);

  };

  points.getAccuracyColor = function(val) {

    var mVal = Math.round(map(val, 0, 1, 0, 255));

    var rr = 255 - mVal;
    var gg = 0 + mVal;
    var bb = 0;

    return 'rgb(' + rr + ',' + gg + ',' + bb + ')';

  };
    
    points.clear = function() {
        points.length = 0;
        sampsX.clear();
        sampsY.clear();
    }

  return points;
}
