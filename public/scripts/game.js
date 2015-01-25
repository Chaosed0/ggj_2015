
define(['crafty', 'jquery', './Util', './Pathfinder', './dialog',
        './CollisionResolver',
        './Polygon',
        './StayOn',
        './SlashAttack',
        './HurtEnemy',
        './Expires',
        './Pathing',
        './generator'
    ], function(Crafty, $, util, Pathfinder, dialog) {
    var self = this;
    var map;   
    var width = $(document).width();
    var height = $(document).height();
    var gameElem = document.getElementById('game');
	var scale = 1;

    dialog.init(width, height);

    Crafty.init(width, height, gameElem);
    Crafty.pixelart(true);

    Crafty.scene("Load", function() {

        var Load = Crafty.e("2D, Canvas, Text")
            .attr({x: width/2.0 - 120, y: height/2.0})
            .text("Loading");

        Crafty.scene("Main");
    });
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

        //Player
        var player = Crafty.e("Player, 2D, Canvas, Text, Fourway, CollisionResolver, StayOn, SlashAttack, Collision")
            .attr({ 
                z: 10, w: 8, h: 8 
            })
            .text("☺")
            .collision()
            .collisionresolver('Solid')
            .stayon("Ground")
            .slashattack(Crafty.keys.SPACE, "Enemy")
            .bind("Moved", function(oldpos) {
                Crafty.viewport.x = - (this.x - width/2.0/scale + this.w);
                Crafty.viewport.y = - (this.y - height/2.0/scale + this.h);
            });

        var g = Crafty.e("Generator").configure({width: 1000, height: 1000, treeDensity:.05})
            .bind("PreIsland", function(data) {
                player.attr({
                        x: data.center[0] + data.radius/2, 
                        y: data.center[1] + data.radius/2, 
                    })
                    .textFont({size: this.tilesize + "px"})
                    .fourway(this.tilesize/4);
            })
            .bind("PostIsland", function() {
                var pathfinder = new Pathfinder();
                pathfinder.buildmap();
                this.pathfinder = pathfinder;
            });

        var island = g.generateIsland(); 

        Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
        Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
        Crafty.viewport.scale(scale);
        Crafty.pixelart(true);

        //console.log(util.generateDialog());
        //util.playDialog();
        //pathfinder.render();
    });
    
    Crafty.scene("Load");
});
