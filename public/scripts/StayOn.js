

define(['crafty'], function(Crafty) {

    var moved = function(oldpos) {
        var collisions = this.hit(this._stayoncomp);
        var gotHit = (collisions != false);
        var found = false;

        //Find the ground
        if (gotHit) {
            for(var i = 0; i < collisions.length; i++) {
                var data = collisions[i];
                if(data.obj.has(this._stayoncomp)) {
                    found = true;
                    break;
                }
            }
        }

        if(!found) {
            this.x = oldpos.x;
            this.y = oldpos.y;
        }
    };

    Crafty.c("StayOn", {
        _stayoncomp: null,

        init: function () {
            this.requires("2D");
            this.requires("Collision");
        },

        stayon: function (comp) {
            if (comp) this._stayoncomp = comp;

            this.bind("Moved", moved);

            return this;
        },
    });
});
