
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
        var player = Crafty.e("Player, 2D, Canvas, Text, Fourway, CollisionResolver, StayOn, SlashAttack, Collision, Solid")
            .attr({ 
                z: 10, w: 8, h: 8,
                destroyWorld: false
            })
            .text("☺")
            .collision()
            .collisionresolver('Solid')
            .stayon("Ground")
            .slashattack(Crafty.keys.SPACE, "Enemy")
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
                            this.destroy();
                            Crafty.scene("Main");
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
                        for (var i = 0; i < all.length; i++) {
                            e = all.get(i);
                            if (!e.has("Trinket") && !e.has("Player")) {
                                e.destroy();
                                return;
                            }
                        }
                    }
                }
            });

        window.player = player;

        var g = Crafty.e("Generator").configure({width: 6000, height: 6000, treeDensity:.05})
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
