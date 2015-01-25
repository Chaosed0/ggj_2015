
define(['crafty', './Pathfinder',
    ], function(Crafty, Pathfinder) {
    var Vec2d = Crafty.math.Vector2D;

    var enterFrame = function(data) {
        this._nextpathtimer += data.dt;
        if(this._nextpathtimer >= this._pathinterval) {
            this._nextpathtimer -= this._pathinterval;

            this._currentpath = this._getPath();
        }

        if(this._currentpath.length > 0) {
            var pos = new Vec2d(this.x, this.y);
            var target_obj = this._currentpath[this._currentpath.length - 1];
            var target = new Vec2d(target_obj.x, target_obj.y);

            this._moveTowards(target.clone().subtract(pos));

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
        _pathspeed: 3,
        _directpathradius: 1000,
        _originalpos: null,
        _homecenter: null,
        _homerange: 0,

        _getPath: function() {
            var ents = Crafty(this._pathtocomp);
            if(ents) {
                var ent;
                if(ents.length <= 1) {
                    ent = ents;
                } else {
                    ent = ents.get(0);
                }
                var start = new Vec2d(this.x, this.y);
                var dest = new Vec2d(ent.x, ent.y);
                var path = null;
                
                if(this._homecenter) {
                    //If destination is too far from our home, don't path
                    var homecenter = new Vec2d(this._homecenter[0], this._homecenter[1]);
                    if(dest.distance(homecenter) > this._homerange) {
                        //If we're already home, don't path anywhere and stop early;
                        // otherwise, go back home instead of at player
                        if(this._originalpos.distance(start) < 10.0) {
                            path = [];
                        } else {
                            dest = this._originalpos;
                        }
                    }
                }

                //Make sure we don't already have a path
                if(!path) {
                    //Only try to actually pathfind if we're close enough that
                    // the player could tell that we're being dumb
                    if(dest.distance(start) > this._directpathradius) {
                        path = [dest];
                    } else {
                        if(this._pathfinder.checklos(start, dest)) {
                            path = [dest];
                        } else {
                            path = this._pathfinder.findpath(start, dest);
                        }
                    }
                }

                if(path) {
                    return path;
                }
            }
            return [];
        },

        _moveTowards: function(dir) {
            var savedPos = {x: this.x, y: this.y};
            dir = dir.normalize();
            this.x += dir.x * this._pathspeed;
            this.y += dir.y * this._pathspeed;
            this.trigger("Moved", savedPos);
        },

        init: function() {
            this.bind("StartPathing", this.startPathing);
            this.bind("StopPathing", this.stopPathing);

            if(this._pathing) {
                this._currentpath = this._getPath();
                this.bind("EnterFrame", enterFrame);
            }

            this._originalpos = new Vec2d(this._x, this._y);
        },

        startPathing: function() {
            this._pathing = true;
            //Set to random so not all entities path on the same frame
            this._nextpathtimer = Math.floor(Math.random() * this._pathinterval);
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

        homecenter: function(homecenter) {
            this._homecenter = homecenter;
            return this;
        },

        homerange: function(homerange) {
            this._homerange = homerange;
            return this;
        },
    });
});
