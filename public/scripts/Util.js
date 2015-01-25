
define(function() {
    var exports = {
        supportsAudio: null,
        audioContext: null,
        

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

        generateCharacter: function() {
            return unescape("%u" + (9472 + parseInt(Math.random() * 300)).toString(16));
        },

        generateDialog: function(length) {
            length = typeof length !== 'undefined' ? length : 20;

            var s = this.generateCharacter();

            while (s.length < length) {
                if (Math.random() < .3) {
                    s += " ";
                } else {
                    s += this.generateCharacter();
                }
            }

            return s;
        },

        playDialog: function(length) {
            length = typeof length !== 'undefined' ? length : 5;
            if (this.supportsAudio && length) {
                var freq = parseInt(100 + Math.random() * 1000);
                var duration = parseInt(5 + Math.random() * 10);

                var osc = this.audioContext.createOscillator();
                osc.connect(this.audioContext.destination);
                osc.frequency.value = freq;
                osc.type = ["square", 'triangle', 'sine', 'sawtooth'][Math.floor(Math.random() *4)];
                osc.start(0);

                var _this = this;
                setTimeout(function() {
                    console.log(duration);
                    osc.stop(0);
                    _this.playDialog(length-1);
                }, duration);
            }
        }
    };

    try {
        new webkitAudioContext();
        exports.supportsAudio = true;
        exports.audioContext = new webkitAudioContext();
    } catch (e) {
        exports.supportsAudio = false;
    }

    return exports;
});
