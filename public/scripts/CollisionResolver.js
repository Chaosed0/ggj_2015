
define(['crafty', './dialog'], function(Crafty, dialog) {

    var moved = function() {
        var collisions = this.hit(this._anti);
        var gotHit = (collisions != false);

        //If we're intersecting, push the player out
        if (gotHit) {
            var data = collisions[0];

            this.x -= data.normal.x * data.overlap;
            this.y -= data.normal.y * data.overlap;

            this.trigger("Hit", data);
            if (this.has("Player")) {
                data.obj.trigger("HitPlayer", data);
            } else if (data.obj.has("Player")) {
                this.trigger("HitPlayer", data);
            }

            if (this.has("Player") && data.obj.has("Trinket") && !dialog.currentlyPlaying) {

                this.text("☹");
                this.textColor("#FF0000");
                this.fourway(0);
                if (window.level == window.lastLevel) {
                    dialog.playDialog(0, 1, 200, "sawtooth");
                    Crafty.audio.stop();
                } else {
                    dialog.playDialog(0, 300, 15, "square");
                    this.trigger("PlayDialog");
                }
                this.destroyWorld = true;
            }
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
