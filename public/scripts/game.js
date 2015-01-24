
define(['crafty', 'jquery',
        './CollisionResolver',
        './Polygon'
    ], function(Crafty, $) {
    var self = this;
    var map;
    
    var width = 800;
    var height = 600;
    var gameElem = document.getElementById('game');
	var scale = 1.0;

    Crafty.init(width, height, gameElem);  			  		
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

		var wallPolygon = new Crafty.polygon([[100, 100], [200, 200], [500, 200]]);

		//A wall
		var wall = Crafty.e("2D, Canvas, Polygon, Collision, Wall")
			.attr({x: 0, y: 0})
            .collision(wallPolygon)
            .polygon(wallPolygon.points, "#BB00BB");

		/*var box = Crafty.e("2D, Canvas, Color, Collision, Wall")
			.attr({x: 20, y: 20, w: 50, h: 50})
            .collision()
            .color(255, 255, 255);*/

        //Player
        var player = Crafty.e("2D, Canvas, Color, Fourway, CollisionResolver, Collision")
            .attr({ x: 0, y: 0, z: 10, w: 8, h: 8 })
			.color(0, 0, 0)
            .fourway(2)
            .collision()
            .collisionresolver('Wall')
			.bind("Moved", function(oldpos) {
				Crafty.viewport.x = - (this.x - width/2.0/scale + this.w);
				Crafty.viewport.y = - (this.y - height/2.0/scale + this.h);
			});

		Crafty.background("#BB7799");
		Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
		Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
		Crafty.viewport.scale(scale);
		Crafty.pixelart(true);
    });
    
    Crafty.scene("Main");
});
