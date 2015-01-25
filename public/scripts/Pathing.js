
define(['crafty', './Pathfinder',
    ], function(Crafty, Pathfinder) {
    var Vec2d = Crafty.math.Vector2D;

    var enterFrame = function(data) {
        //this._nextpathtimer += data.dt;
        if(this._nextpathtimer >= this._pathinterval) {
            this._nextpathtimer -= this._pathinterval;

            this._currentpath = this._getPath();
        }

        if(this._currentpath.length > 0) {
            var pos = new Vec2d(this.pos.x, this.pos.y);
            var target_obj = this._currentpath[this._curentPath.length - 1];
            var target = new Vec2d(target_obj.x, target_obj.y);

            this._moveTowards(target.subtract(pos));

            if(pos.distance(target) < 1.0) {
                this._currentPath.pop();
            }
        }
    }

    Crafty.c("Pathing", {
        _pathtocomp: "Player",
        _pathinterval: 1000,
        _nextpathtimer: 0,
        _pathfinder: null,
        _pathing: false,
        _currentpath: [],
        _speed: 3,

        _getPath: function() {
            return this._pathfinder.findPath(this._pathtocomp);
        },

        _moveToward: function(dir) {
            dir = dir.normalize();
            this.x += dir.x * this._speed;
            this.y += dir.y * this._speed;
        },

        init: function() {
            this.bind("StartPathing", this.startPathing);
            this.bind("StopPathing", this.stopPathing);
        },

        startPathing: function() {
            this._pathing = true;
        },

        stopPathing: function() {
            this._pathing = false;
        },

        pathing: function(pathfinder) {
            if(arguments.length < 1) {
                console.log("You MUST specify a pathfinder for the Pathing component!");
            }
            this._pathfinder = pathfinder;
            return this;
        },
    });
});
