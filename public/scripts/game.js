
define(['crafty', 'jquery', './Util',
        './CollisionResolver',
        './Polygon',
        './StayOn',
        './SlashAttack',
        './HurtEnemy',
        './Expires',
        './generator'
    ], function(Crafty, $, util) {
    var self = this;
    var map;
    
    var width = $(document).width();
    var height = $(document).height();
    var gameElem = document.getElementById('game');
	var scale = 1.0;

    Crafty.init(width, height, gameElem);  			  		
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

		/*var wallPolygon = new Crafty.polygon([[0, 0], [100, 100], [500, 200]]);
        var boundBox = util.getBoundBox(wallPolygon);
        console.log(boundBox);

		//A wall
		var solid = Crafty.e("2D, Canvas, Polygon, Collision, Solid")
			.attr({x: 0, y: 0, w:boundBox.x+boundBox.w, h:boundBox.y+boundBox.h})
            .polygon(wallPolygon, "#BB00BB")
            .collision(wallPolygon);

        var stayon = Crafty.e("2D, Canvas, Color, Collision, Ground")
            .attr({x: -100, y: -100, w: 200, h: 200, z: -1})
            .collision()
            .color("#FFFFFF");
        */

        var g = Crafty.e("Generator");
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

		//Crafty.background("#BB7799");
		Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
		Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
		Crafty.viewport.scale(scale);
		Crafty.pixelart(true);
    });
    
    Crafty.scene("Main");
});
