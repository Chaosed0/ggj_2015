
define(['crafty'], function(Crafty) {

    var moved = function() {
        var collisions = this.hit(this._anti);
        var gotHit = (collisions != false);

        //If we're intersecting, push the player out
        if (gotHit) {
            var data = collisions[0];

            this.x -= data.normal.x * data.overlap;
            this.y -= data.normal.y * data.overlap;
            this.trigger("Hit", data);
            data.obj.trigger("HitPlayer", data);
        }
    };

    Crafty.c("CollisionResolver", {
        _anti: null,

        init: function () {
            this.requires("2D");
            this.requires("Collision");
        },

        collisionresolver: function (comp) {
            if (comp) this._anti = comp;

            this.bind("Moved", moved);

            return this;
        },
    });
});
