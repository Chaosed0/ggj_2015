
define(['crafty', 'jquery', './Util', './Pathfinder', './dialog',
        './CollisionResolver',
        './Polygon',
        './StayOn',
        './HurtEnemy',
        './Expires',
        './Pathing',
        './generator',
		'./seedrandom'
    ], function(Crafty, $, util, Pathfinder, dialog) {
    var self = this;
    var map;   
    var width = $(document).width();
    var height = $(document).height();
    var gameElem = document.getElementById('game');
	var scale = 1;
	var randomSeed;
	var levelSeeds = [];
    window.level = 0;
    window.lastLevel = 10000;
    window.levelInc = 2000;

    dialog.init(width, height);

    Crafty.init(width, height, gameElem);
    Crafty.pixelart(true);

    Crafty.scene("Load", function() {

        var Load = Crafty.e("2D, Canvas, Text")
            .attr({x: width/2.0 - 120, y: height/2.0})
            .text("Loading");

        Crafty.audio.add({
            overworld: [
                "audio/overworld.mp3",
                "audio/overworld.ogg",
            ],
            credits: [
                "audio/credits.mp3",
                "audio/credits.ogg"
            ]
        });
		
		randomSeed = util.getUrlParameter("seed");
		if (randomSeed === null) {
			randomSeed = parseInt(Math.random() * 10000000).toString();
		}
		
		console.log(randomSeed);
		window.randomSeed = randomSeed;

		Math.seedrandom(randomSeed);	
			
		for (var i = 0; i < window.lastLevel/window.levelInc; i++) {
			levelSeeds.push(parseInt(Math.random() * 100000000).toString());
		}
		
        Crafty.scene("Main");
    });
                        
    Crafty.scene("Main", function () {
                                    
        console.log("MAIN");

		Math.seedrandom(levelSeeds.pop());
		
        //Player
        var player = Crafty.e("Player, 2D, Canvas, Text, Fourway, CollisionResolver, StayOn, Collision, Solid")
            .attr({ 
                z: 10, w: 8, h: 8,
                destroyWorld: false
            })
            .text("☺")
            .collision()
            .collisionresolver('Solid')
            .stayon("Ground")
            .bind("Moved", function(oldpos) {
                Crafty.viewport.x = - (this.x - width/2.0/scale + this.w);
                Crafty.viewport.y = - (this.y - height/2.0/scale + this.h);
            })
            .bind("EnterFrame", function(e) {
                if (this.destroyWorld) {
                    //console.log("Frame");
                    var all = Crafty("obj");
                    var e;
                    if (all.length == 1){
                        if (!dialog.currentlyPlaying)
                        {
                            if (window.level < window.lastLevel) {
                                this.destroy();
                                Crafty.scene("Main");
                            } else if(!this.worlddead) {
                                this.worlddead = true;
                                var _this = this;
                                setTimeout(function() {
                                    _this.destroy();
                                    setTimeout(function() {
                                        console.log("aaa");
                                        dialog.credits = true;
                                        Crafty.audio.play("credits", -1);
                                        dialog._playDialog("Made by Ed Lu and Jeremy Neiman ", 0, 300, 32);
                                    }, 2000);
                                }, 2000);
                            }
                        }
                    } else if (all.length == 2) {
                        if (!dialog.currentlyPlaying)
                        {
                            for (var i = 0; i < all.length; i++) {
                                e = all.get(i);
                                if (e.has("Trinket")) {
                                    e.destroy();
                                    return;
                                }
                            }
                        }
                    } else {
                        var speed = window.level/window.levelInc;
                        var count = 0;
                        for (var i = all.length - 1; i >= 0; i--) {
                            e = all.get(i);
                            if (!e.has("Trinket") && !e.has("Player")) {
                                e.destroy();
                                count += 1;
                                if (count >= speed) {
                                    return;
                                }
                            }
                        }
                    }
                }
            });

        window.player = player;
        window.level += window.levelInc;

        var center, radius;

        var g = Crafty.e("Generator").configure({width: window.level, height: window.level, treeDensity:.05})
            .bind("PreIsland", function(data) {
                center = data.center;
                radius = data.radius;
            })
            .bind("PostIsland", function() {
                var pathfinder = new Pathfinder();
                var w = 20;
                var h = 20;
                var x,y;
	            while (true) {
	                x = (center[0] + radius/2 + (.5 - Math.random()) * 3*radius/2);
	                y = (center[1] + radius/2 + (.5 - Math.random()) * 3*radius/2);

	                // Make sure the tree is on ground
	                var t1 = Crafty.map.search({_x: x,   _y: y+h-4, _w: 1, _h: 4}, true);
	                var t2 = Crafty.map.search({_x: x+w, _y: y+h-4, _w: 1, _h: 4}, true);
	                if (t1.length > 0 && t2.length > 0) {
	                    // Make sure it's not on water/bridge/trees
	                    if (!util.searchContains([t1,t2], ['River', 'Bridge', 'Tree'])) {
	                        break;
	                    }
	                }
	            }

                player.attr({ x: x, y: y, })
                    .textFont({size: this.tilesize + "px"})
                    .fourway(this.tilesize/4);

                pathfinder.buildmap();
                this.pathfinder = pathfinder;
            });

        
        var island = g.generateIsland(window.level, window.level); 

        Crafty.viewport.x = - (player.x - width/2.0/scale + player.w);
        Crafty.viewport.y = - (player.y - height/2.0/scale + player.h);
        Crafty.viewport.scale(scale);
        Crafty.pixelart(true);

        Crafty.audio.play("overworld", -1);
    });
    
    Crafty.scene("Load");
});
