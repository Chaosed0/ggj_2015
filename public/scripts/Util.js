
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
        },

        //Lifted wholesale from the Collision component's _SAT
        SAT: function(poly1, poly2) {
            var points1 = poly1.points,
                points2 = poly2.points,
                i = 0,
                l = points1.length,
                j, k = points2.length,
                normal = {
                    x: 0,
                    y: 0
                },
                length,
                min1, min2,
                max1, max2,
                interval,
                MTV = null,
                MTV2 = null,
                MN = null,
                dot,
                nextPoint,
                currentPoint;

            //loop through the edges of Polygon 1
            for (; i < l; i++) {
                nextPoint = points1[(i == l - 1 ? 0 : i + 1)];
                currentPoint = points1[i];

                //generate the normal for the current edge
                normal.x = -(nextPoint[1] - currentPoint[1]);
                normal.y = (nextPoint[0] - currentPoint[0]);

                //normalize the vector
                length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                normal.x /= length;
                normal.y /= length;

                //default min max
                min1 = min2 = Infinity;
                max1 = max2 = -Infinity;

                //project all vertices from poly1 onto axis
                for (j = 0; j < l; ++j) {
                    dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
                    if (dot > max1) max1 = dot;
                    if (dot < min1) min1 = dot;
                }

                //project all vertices from poly2 onto axis
                for (j = 0; j < k; ++j) {
                    dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
                    if (dot > max2) max2 = dot;
                    if (dot < min2 ) min2 = dot;
                }

                //calculate the minimum translation vector should be negative
                if (min1 < min2) {
                    interval = min2 - max1;

                    normal.x = -normal.x;
                    normal.y = -normal.y;
                } else {
                    interval = min1 - max2;
                }

                //exit early if positive
                if (interval >= 0) {
                    return false;
                }

                if (MTV === null || interval > MTV) {
                    MTV = interval;
                    MN = {
                        x: normal.x,
                        y: normal.y
                    };
                }
            }

            //loop through the edges of Polygon 2
            for (i = 0; i < k; i++) {
                nextPoint = points2[(i == k - 1 ? 0 : i + 1)];
                currentPoint = points2[i];

                //generate the normal for the current edge
                normal.x = -(nextPoint[1] - currentPoint[1]);
                normal.y = (nextPoint[0] - currentPoint[0]);

                //normalize the vector
                length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                normal.x /= length;
                normal.y /= length;

                //default min max
                min1 = min2 = Infinity;
                max1 = max2 = -Infinity;

                //project all vertices from poly1 onto axis
                for (j = 0; j < l; ++j) {
                    dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
                    if (dot > max1) max1 = dot;
                    if (dot < min1) min1 = dot;
                }

                //project all vertices from poly2 onto axis
                for (j = 0; j < k; ++j) {
                    dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
                    if (dot > max2) max2 = dot;
                    if (dot < min2) min2 = dot;
                }

                //calculate the minimum translation vector should be negative
                if (min1 < min2) {
                    interval = min2 - max1;

                    normal.x = -normal.x;
                    normal.y = -normal.y;
                } else {
                    interval = min1 - max2;
                }

                //exit early if positive
                if (interval >= 0) {
                    return false;
                }

                if (MTV === null || interval > MTV) MTV = interval;
                if (interval > MTV2 || MTV2 === null) {
                    MTV2 = interval;
                    MN = {
                        x: normal.x,
                        y: normal.y
                    };
                }
            }

            return {
                overlap: MTV2,
                normal: MN
            };
        }
    }

    return exports;
});
