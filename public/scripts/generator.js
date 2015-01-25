define(['crafty', './Util', './dialog', './Polygon', 'numeric',], function(Crafty, util, dialog) {
    Crafty.c("Generator", {

    	waterColor: '#000055',
    	groundColors: [
    		'#FBB49C', '#FF9933', '#C7C7C7', 
    		'#FFDEB3', '#6E6E6E', '#83BA79'
		],
		bridgeColor: "#633200",
		treeColors: ["#106E00", "#47FFB6", "#76A683", "#B88C61"],

		edges: [
            { //Bottom
                getXY: function(w, h, center, radius, j) {
                    //Bottom
                    return [center[0] + j, center[1] + radius];
                },

                break: function(j, w, h, radius) {
                    return (j + w > radius);
                },

                inc: function(j, w, h) {
                    return j + w;
                }
            },
            { //Top
                getXY: function(w, h, center, radius, j) {
                    //Bottom
                    return [center[0] + j, center[1] - h];
                },

                break: function(j, w, h, radius) {
                    return (j + w > radius);
                },

                inc: function(j, w, h) {
                    return j + w;
                }
            },
            { //Left
                getXY: function(w, h, center, radius, j) {
                    //Bottom
                    return [center[0] - w, center[1] + j];
                },

                break: function(j, w, h, radius) {
                    return (j + h > radius);
                },

                inc: function(j, w, h) {
                    return j + h;
                }
            },
            { //Left
                getXY: function(w, h, center, radius, j) {
                    //Bottom
                    return [center[0] + radius, center[1] + j];
                },

                break: function(j, w, h, radius) {
                    return (j + h > radius);
                },

                inc: function(j, w, h) {
                    return j + h;
                }
            }
        ],


    	tilesize:32,
    	width: 6400,
    	height: 6400,
    	treeDensity: .2,
    	races: [],


    	configure: function(properties) {
    		for (p in properties) {
    			this[p] = properties[p];
    		}
    		return this;
    	},

    	adjustToTilesize: function(v) {
        	return v - v % this.tilesize;
    	},

    	generateLand: function(radius, center) {
    		var groundColor = this.groundColors[Math.floor(Math.random() * this.groundColors.length)];
    		Crafty.e('2D, Canvas, Color, Ground')
	        	.attr({x: center[0], y: center[1], w: radius, h: radius})
	        	.color(groundColor);

	        for (var i = 0; i < this.edges.length; i++) {
	            var j = this.adjustToTilesize(Math.round(Math.random() * 10));
	            while (j < radius) {
	                var w = this.adjustToTilesize(Math.round(radius/4 * Math.random()));
	                var h = w;
	                
	                if (this.edges[i].break(j, w, h, radius)) {
	                    break;
	                }

	                var xy = this.edges[i].getXY(w, h, center, radius, j);

	                Crafty.e('2D, Canvas, Color, Ground').attr({x: xy[0], y: xy[1], w: w, h: h}).color(groundColor);
	                j = this.edges[i].inc(j, w, h);
	            }
	        }
    	},

    	generateRivers: function(radius, center, maxRivers) {
    		maxRivers = typeof maxRivers !== 'undefined' ? maxRivers : 1;

    		var n = Math.round(Math.random() * maxRivers);
	        var previousY = center[1] + radius/2 + (.5 - Math.random()) * radius/4;
	        var n = 1;
	        for (var i = 0; i < n; i++) {
	            // Pick starting point
	            var origins = [];
	            while (origins.length < 4) {
	                var px = this.adjustToTilesize(center[0] + origins.length*radius/4 + Math.round(radius/4 * Math.random()));
	                var py = this.adjustToTilesize(previousY + (.5 - Math.random()) * radius / 4);
	                previousY = py;


	                if (Crafty.map.search({_x: px, _y: py, _w: this.tilesize, _h: this.tilesize}, true)) {
	                    origins.push([px,py]);
	                }
	            }

	            var spline = numeric.spline(
	                origins.map(function(t) {return t[0]}),
	                origins.map(function(t) {return t[1]})
	            );

	            var points = [];

	            var start = center[0] - radius/4;
	            var end = center[0] + 5/4 * radius;
	            var step = this.tilesize;
	            for (var x = start; x < end; x += step) {
	                var y = this.adjustToTilesize(Math.round(spline.at(x)));
	                if (x > origins[1][0] - this.tilesize*2 && x < origins[1][0] + this.tilesize*2) {
	                    Crafty.e('2D, Canvas, Color, Bridge')
	                        .attr({x: x, y: y, w: this.tilesize*2, h: this.tilesize*2})
	                        .color(this.bridgeColor);
	                } else {
	                    Crafty.e('2D, Canvas, Color, Collision, Solid, River')
	                        .attr({x: x, y: y, w: this.tilesize*2, h: this.tilesize*2})
	                        .color(this.waterColor).collision();
	                }
	            }
	        }
    	},

    	generateTrees: function(radius, center, treeDensity) {
    		// Trees
    		treeDensity = typeof treeDensity !== 'undefined' ? treeDensity : .2;
	        var numTrees = Math.round(radius * treeDensity);

	        var treeColor = this.treeColors[Math.floor(Math.random() * this.treeColors.length)];

	        for (var i = 0; i < numTrees; i++) {
	            var w = this.tilesize + Math.round(Math.random()*this.tilesize/2);
	            var h = this.tilesize + w;
	            var x,y;

	            while (true) {
	                x = (center[0] + radius/2  + (.5 - Math.random()) * 3*radius/2);
	                y = (center[1] + radius/2 + (.5 - Math.random()) * 3*radius/2);

	                // Make sure the tree is on ground
	                var t1 = Crafty.map.search({_x: x, _y: y+h-4, _w: 1, _h: 4}, true);
	                var t2 = Crafty.map.search({_x: x+w, _y: y+h-4, _w: 1, _h: 4}, true);
	                if (t1.length > 0 && t2.length > 0) {
	                    // Make sure it's not on water/bridge/trees
	                    if (!util.searchContains([t1,t2], ['River', 'Bridge', 'Tree'])) {
	                        break;
	                    }
	                }
	            }
	            var treePolygon = new Crafty.polygon([[w/2, 0], [0, h], [w,h]]);
	            var trunkPolygon = new Crafty.polygon([[0, h], [w,h], [w, h-this.tilesize/2], [0,h-this.tilesize/2]]);

	            var boundBox = util.getBoundBox(treePolygon);
	            var tree = Crafty.e("2D, Canvas, Polygon, Collision, Solid, Tree")
	                .attr({z: 11, x: x, y: y, w:w, h:h-this.tilesize/2})
	                .polygon(treePolygon, treeColor)
	                .collision(trunkPolygon);
	        }
    	},


    	pickNumberRaces: function(radius) {
    		if (radius >= 6000) {
    			return 9;
    		} else if (radius >= 2000) {
    			return 4;
    		} else {
                return 1;
            }
    	},

    	generateIsland: function(width, height) {
    		width = typeof width !== 'undefined' ? width : this.width;
    		height = typeof height !== 'undefined' ? height : this.height;

    		Crafty.background(this.waterColor);

	        var radius = this.adjustToTilesize(Math.round(Math.min(width, height) * (.7 - (Math.random()/2))));
	        var center = [width/2 - radius/2, height/2 - radius/2];

            this.trigger("PreIsland", {radius: radius, center: center});

	        this.generateLand(radius, center);

	        this.generateRivers(radius, center, 1);
	        
	        this.generateTrees(radius, center, this.treeDensity);

            this.trigger("PostIsland");

	        var numberRaces = this.pickNumberRaces(radius);
	        this.generateRaces(radius, center, numberRaces);
	        this.generateNPCs(radius, center);

            this.generateTrinket(radius, center);

	        return [radius, center];

    	},

    	generateRaceCharacter: function() {
    		return unescape("%u" + (255*(parseInt(Math.random()*50)+20) + 
    			parseInt(Math.random() * 255)).toString(16));
    	},

        generateTrinketCharacter: function() {
            return unescape("%u" + (9812 + parseInt(Math.random() * 12)).toString(16));
        },

    	generateRaces: function(radius, center, numberRaces) {
    		numberRaces = typeof numberRaces !== 'undefined' ? numberRaces : 1;

    		for (var i = 0; i < numberRaces; i++) {
    			var race = {};
    			race.character = this.generateRaceCharacter();
    			race.friendlyness = parseInt(Math.random() * 100);
    			race.aggressiveness = parseInt(Math.random() * 100);
    			race.averageSize = this.tilesize/2 + parseInt(Math.random()*this.tilesize*2);
    			race.baseFreq = 1200 - race.averageSize * 16 + parseInt(Math.random() * 100);
    			race.baseDur = 120 - parseInt(race.baseFreq/10);
    			var w = parseInt(Math.sqrt(numberRaces));
    			var blockSize = 3/2*radius/w;
    			race.homeCenter = [
    				center[0] - radius/4 + blockSize*(i % w) + blockSize/2,
    				center[1] - radius/4 + blockSize*parseInt(i / w) + blockSize/2
    			];
    			race.range = blockSize/2 - parseInt(blockSize/race.averageSize/2);
    			
    			race.population = parseInt(300/race.averageSize);
    			this.races.push(race);
    		}
    	},

    	generateNPCs: function(radius, center) {
    		for (var i = 0; i < this.races.length; i++) {
    			var race = this.races[i];
    			for (var j = 0; j < race.population; j++) {
    				var w,h,x,y;

    				while (true) {
    					w = race.averageSize;
    					h = race.averageSize;
		                //x = (center[0] + radius/2  + (.5 - Math.random()) * 3*radius/2);
		                //y = (center[1] + radius/2 + (.5 - Math.random()) * 3*radius/2);
		                x = parseInt(race.homeCenter[0] + race.range * (.5 - Math.random()));
		                y = parseInt(race.homeCenter[1] + race.range * (.5 - Math.random()));


		                var t1 = Crafty.map.search({_x: x, _y: y, _w: w, _h: h}, true);
		                if (t1.length > 0) {
		                    // Make sure it's not on water/bridge/trees
		                    if (!util.searchContains([t1], ['River', 'Bridge', 'Tree', 'NPC', 'Player'])) {
		                        break;
		                    }
		                }
		            }


    				var guy = Crafty.e("2D, Canvas, Text, Collision, Solid, NPC, CollisionResolver")
			            .attr({ 
			                x: x, 
			                y: y, 
			                w: w, h: h,
			                z: 10,
			                baseFreq: race.baseFreq,
			                baseDur: race.baseDur,
                            homeCenter: race.homeCenter,
                            homeRange: race.range
			            })
			            .text(race.character)
			            .textFont({size: w + "px"})
			            .collision()
                        .collisionresolver("Solid")
			            .bind("HitPlayer", function(data) {
			            	dialog.playDialog(this.baseFreq, this.baseDur);
			            });

                    if(false && this.pathfinder) {
                        guy.addComponent(this.pathfinder, "Pathing")
                            .pathing(this.pathfinder, "Player");
                        guy.startPathing();
                    }
    			}
    		}
    	},

        

        generateTrinket: function(radius, center, size) {
            size = typeof size !== 'undefined' ? size : this.tilesize*4;
            var w = size, h = size;
            var x,y;
            while (true) {
                x = (center[0] + radius/2  + (.5 - Math.random()) * 3*radius/2);
                y = (center[1] + radius/2 + (.5 - Math.random()) * 3*radius/2);

                var t1 = Crafty.map.search({_x: x, _y: y, _w: w, _h: h}, true);
                if (t1.length > 0) {
                    // Make sure it's not on water/bridge/trees
                    if (!util.searchContains([t1], ['River', 'Bridge', 'Tree', 'NPC', 'Player'])) {

                        // Make sure it's not near the Player
                        var t2 = Crafty.map.search({_x: x-radius/4, _y: y-radius/4, _w: radius/2, _h: radius/2}, true);
                        if (!util.searchContains([t2], ['Player'])) {
                            break;
                        }
                    }
                }

            }

            var trinket = Crafty.e("2D, Canvas, Text, Collision, Solid, Trinket")
                .attr({
                    x: x, y: y, w: w, h: h, z: 10, 
                    colorTimer: 0, colorInterval: 500,
                })
                .text(this.generateTrinketCharacter())
                .textFont({size: size + "px"})
                .textColor(util.randomColor())
                .collision()
                .bind("EnterFrame", function(e) {
                    this.colorTimer += e.dt;
                    if (this.colorTimer >= this.colorInterval) {
                        this.colorTimer -= this.colorInterval;
                        this.textColor(util.randomColor());
                    }
                })
        }
    });
});
