
define(['crafty'], function(Crafty) {
    var Vec2d = Crafty.math.Vector2D;
    var coneangle = 3.14159/3.0;
    var conelength = 20;
    var conetime = 200;
    var conecolor = "#FF0000";

    var keydown = function(e) {
        if (e.key == this._attackkey) {
            var origin = {x: this._w/2.0, y: this._h/2.0};

            var x = this._slashattackdirection.x;
            var y = this._slashattackdirection.y;
            var attackDirection = new Vec2d(x, y);
            var angle = Math.atan2(attackDirection.y, attackDirection.x);
            var p1 = {x: origin.x + conelength * Math.cos(angle-coneangle/2.0),
                      y: origin.y + conelength * Math.sin(angle-coneangle/2.0)};
            var p2 = {x: origin.x + conelength * Math.cos(angle+coneangle/2.0),
                      y: origin.y + conelength * Math.sin(angle+coneangle/2.0)};

            //Passing by reference does something stupid and I don't know what
            var conepoly = [[origin.x,origin.y], [p1.x, p1.y], [p2.x, p2.y]];
            var colpoly = new Crafty.polygon([[origin.x,origin.y], [p1.x, p1.y], [p2.x, p2.y]]);

            var attackCone = Crafty.e("2D, Canvas, Polygon, Expires, Collision, HurtEnemy")
                .attr({x: this._x, y: this._y, z: 10})
                .polygon(conepoly, conecolor)
                .expires(conetime)
                .collision(colpoly)
                .hurtenemy(this._enemycomp);
        }
    }

    var newdirection = function(dir) {
        if(dir.x != 0 || dir.y != 0) {
            this._slashattackdirection = dir;
        }
    }

    Crafty.c("SlashAttack", {
        _slashattackcomp: "Enemy",
        _attackkey: Crafty.keys.SPACE,
        _slashattackdirection: {x: 1, y: 0},

        init: function() {
            this.requires("Keyboard");
            this._initializeAttackControls();
            this.bind("NewDirection", newdirection);
        },

        _initializeAttackControls: function() {
            return this.unbind("KeyDown", keydown)
                       .bind("KeyDown", keydown);
        },

        slashattack: function(key, comp) {
            this._slashattackcomp = comp;
            this._attackkey = key;

            return this;
        },
    });
});
