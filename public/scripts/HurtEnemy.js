
define(['crafty'], function(Crafty) {
    Crafty.c("HurtEnemy", {
        _hurtenemycomp: "Enemy",

        hurtenemy: function(comp) {
            this._hurtenemycomp = comp;
        }
    });
});
