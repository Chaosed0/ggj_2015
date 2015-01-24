
define(['crafty', 'jquery', './Util', './astar',
        './CollisionResolver',
        './Polygon',
        './StayOn',
        './SlashAttack',
        './HurtEnemy',
        './Expires',
        './generator'
    ], function(Crafty, $, util, Pathfinder) {
    var self = this;
    var map;   
    var width = $(document).width();
    var height = $(document).height();
    var gameElem = document.getElementById('game');
	var scale = 1.0;

    Crafty.init(width, height, gameElem);                        

    Crafty.scene("Load", function() {

        var Load = Crafty.e("2D, Canvas, Text")
            .attr({x: width/2.0 - 120, y: height/2.0})
            .text("Loading");

        Crafty.scene("Main");
    });
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

        var g = Crafty.e("Generator").configure({width: 1000, height: 1000, treeDensity:.05});
        var island = g.generateIsland(); 
        var radius = island[0];
        var center = island[1];
        var tilesize = g.tilesize;

        //Player
        var player = Crafty.e("2D, Canvas, Text, Fourway, CollisionResolver, StayOn, SlashAttack, Collision")
            .attr({ 
                x: center[0] + radius/2, 
                y: center[1] + radius/2, 
                z: 10, w: 8, h: 8 
            })
            .text("ಠ")
            .textFont({size: tilesize + "px"})
            .fourway(tilesize/4)
            .collision()
            .collisionresolver('Solid')
            .stayon("Ground")
            .slashattack(Crafty.keys.SPACE, "Enemy")
            .bind("Moved", function(oldpos) {
                Crafty.viewport.x = - (this.x - width/2.0/scale + this.w);
                Crafty.viewport.y = - (this.y - height/2.0/scale + this.h);
            });

        Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
        Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
        Crafty.viewport.scale(scale);
        Crafty.pixelart(true);

        var pathfinder = new Pathfinder();
        pathfinder.buildmap();
        pathfinder.render();
    });
    
    Crafty.scene("Load");
});
