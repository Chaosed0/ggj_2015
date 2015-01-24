
define(function() {
    var exports = {
        getRandom: function(min, max) {
            if(arguments.length > 1) {
                return Math.random() * (max - min) + min;
            } else {
                return Math.random() * min;
            }
        },

        getBoundBox: function(polygon) {
            var points = polygon.points;
            var minPoint = {x: points[0][0], y: points[0][1]};
            var maxPoint = {x: points[0][0], y: points[0][1]};
            for(var i = 1; i < points.length; i++) {
                var point = points[i];
                if(point[0] < minPoint.x) {
                    minPoint.x = point[0];
                }
                if(point[1] < minPoint.y) {
                    minPoint.y = point[1];
                }

                if(point[0] > maxPoint.x) {
                    maxPoint.x = point[0];
                }
                if(point[1] > maxPoint.y) {
                    maxPoint.y = point[1];
                }
            }

            return {x: minPoint.x, y: minPoint.y,
                w: maxPoint.x - minPoint.x,
                h: maxPoint.y - minPoint.y};
        },

        searchContains: function(searches, types) {
            for (var i = 0; i < searches.length; i++) {
                for (var j = 0; j < searches[i].length; j++) {
                    for (var k = 0; k < types.length; k++) {
                        if (searches[i][j].has(types[k])) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }

    return exports;
});
