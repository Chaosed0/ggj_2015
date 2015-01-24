
define(['crafty', 'jquery', 'TiledMapBuilder', 'TiledMapMocks',
        './CollisionResolver'
    ], function(Crafty, $) {
    var self = this;
    var map;
    
    var width = 800;
    var height = 600;
    var gameElem = document.getElementById('game');
	var scale = 4.0;

    Crafty.init(width, height, gameElem);  			  		
    Crafty.scene("Load", function() {

        console.log("LOAD");
        
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w:width, h: 20, x: 0, y: height/2 })
                .text("Loading...")
                .css({ "text-align": "center" });

        var assets = {
            "images": [
                "img/tilesetOnD.png"
            ],
            "sprites": {
                "img/ogre.png": {
                    "tile": 50,
                    "tileh": 67,
                    "map": { "Ogre": [0,0] }
                },
                "img/slime.png": {
                    "tile": 60,
                    "tileh": 36,
                    "map": { "Slime": [0,0] }
                }
            }
        }
        
        //Preload assets first
        Crafty.load(assets, function() {
            $.ajax({
                url:'/maps/untitled.json',
                cache: false,
                dataType: 'json',
                type: 'GET',
                success: function(data) {
                    map = data;
                    Crafty.scene("Main");		
                },
                error: function(error) {
                    console.log('some error happened getting the map');
                }
            });
        });
    });
    
    Crafty.scene("Load");
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");
        var playerSpawnLoc = {x: 150, y:50};

        Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource(map)
            .createWorld(function(tiledmap) {
                //Platforms
                var layers = tiledmap.getLayers();
				console.log(layers);
                for (var i in layers){
					var layer = layers[i];
					for(var j = 0; j < layer.length; j++) {
						var tile = layer[j];
						if(tile.tileproperties && "Edge" in tile.tileproperties) {
							if(tile.gid == 612) {
								console.log("aaa");
							}
							tile.addComponent("Edge")
								.addComponent("Collision")
								.collision()
						}
					}
                }

                //Objects
                var objects = tiledmap.getEntitiesInLayer("Objects");
                for (var i = 0; i < objects.length; i++) {
                    var object = objects[i];
                    var objectCenter = { x: object.x + object.w / 2.0,
                                         y: object.y + object.h / 2.0 };
                    if(object.has("PlayerSpawn")) {
                        playerSpawnLoc = objectCenter;
                    } else {
                        console.log("WARNING: Found unknown object ", object);
                    }
                }

                //Set viewport bounds to map bounds; if we let it auto-clamp to entities,
                // the number of entities that TiledMapBuilder creates destroys framerate
                var map = tiledmap.getSource();
                var bounds = { min: {x:0, y:0},
                   max: {x: map.width * map.tilewidth,
                         y: map.height * map.tileheight}
                };
                Crafty.viewport.bounds = bounds;
            });

        //Player
        var player = Crafty.e("2D, Canvas, Color, Fourway, CollisionResolver, Collision")
            .attr({ x: playerSpawnLoc.x, y: playerSpawnLoc.y, z: 10, w: 8, h: 8 })
			.color(0, 0, 0)
            .fourway(2)
            .collision()
            .collisionresolver('Edge')
			.bind("Moved", function(oldpos) {
				Crafty.viewport.x = - (this.x - width/2.0/scale + this.w);
				Crafty.viewport.y = - (this.y - height/2.0/scale + this.h);
			});

		Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
		Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
		Crafty.viewport.scale(scale);
		Crafty.pixelart(true);
    });
});
