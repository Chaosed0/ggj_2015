
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
            var pos = new Vec2d(this.x, this.y);
            var target_obj = this._currentpath[this._currentpath.length - 1];
            var target = new Vec2d(target_obj.x, target_obj.y);

            this._moveTowards(target.clone().subtract(pos));

            console.log(target.x, target.y, pos.x, pos.y, pos.distance(target));
            if(pos.distance(target) < 4.0) {
                this._currentpath.pop();
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
            var ents = Crafty(this._pathtocomp);
            if(ents) {
                var ent;
                if(ents.length <= 1) {
                    ent = ents;
                } else {
                    ent = ents.get(0);
                }
                var start = {x: this.x, y: this.y}
                var dest = {x: ent.x, y: ent.y};
                var path = this._pathfinder.findpath(start, dest);

                for(var i = 0; i < path.length; i++) {
                    var pathnode = path[i];
                    Crafty.e("2D, Canvas, Color")
                        .attr({x: pathnode.x, y: pathnode.y, z: 10000, w: 4, h: 4})
                        .color("#0000FF");
                }

                return path;
            } else {
                return [];
            }
        },

        _moveTowards: function(dir) {
            var savedPos = {x: this.x, y: this.y};
            dir = dir.normalize();
            this.x += dir.x * this._speed;
            this.y += dir.y * this._speed;
            this.trigger("Moved", savedPos);
        },

        init: function() {
            this.bind("StartPathing", this.startPathing);
            this.bind("StopPathing", this.stopPathing);

            if(this._pathing) {
                this._currentpath = this._getPath();
                this.bind("EnterFrame", enterFrame);
            }
        },

        startPathing: function() {
            this._pathing = true;
            this._currentpath = this._getPath();
            this._nextpathtimer = 0;
            this.bind("EnterFrame", enterFrame);
        },

        stopPathing: function() {
            this._pathing = false;
            this.unbind("EnterFrame", enterFrame);
        },

        pathing: function(pathfinder, comp) {
            if(arguments.length < 1) {
                console.log("You MUST specify a pathfinder for the Pathing component!");
            }
            this._pathtocomp = comp;
            this._pathfinder = pathfinder;
            return this;
        },
    });
});
