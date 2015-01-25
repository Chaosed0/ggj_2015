
define(['crafty', './Util'], function(Crafty, Util) {
    var gridsize = 20;
    var groundComponent = "Ground";
    var solidComponent = "Solid";

    var heuristic = function(start, end) {
        var rel = {x: end.x - start.x, y: end.y - start.y};
        return Math.sqrt(rel.x * rel.x + rel.y * rel.y);
    }

    var pathfinder = function() {
        var map = [];
        var bounds;
        var width, height;
        
        var getTileId = function(tile) {
            return tile.y * width + tile.x;
        }

        var getTileFromId = function(id) {
            return {x: id % width, y: Math.floor(id / width)};
        }

        var reconstruct_path = function(came_from, endTileId) {
            var current = endTileId;
            var currentTile = getTileFromId(endTileId);
            var path = [{x: currentTile.x * gridsize, y: currentTile.y * gridsize}];
            while(current != came_from[current]) {
                var prior = came_from[current];
                var priorTile = getTileFromId(prior);
                path.push({x: (priorTile.x + 0.5) * gridsize, y: (priorTile.y + 0.5) * gridsize});
                var current = prior;
            }
            return path;
        }

        var get_neighbors = function(tile) {
            var neighbors = [];
            if(tile.x > 0) {
                var leftTile = {x: tile.x-1, y: tile.y}
                if(map[getTileId(leftTile)]) {
                    neighbors.push(leftTile);
                }
            }
            if(tile.x < width-1) {
                var rightTile = {x: tile.x+1, y: tile.y}
                if(map[getTileId(rightTile)]) {
                    neighbors.push(rightTile);
                }
            }
            if(tile.y > 0) {
                var upTile = {x: tile.x, y: tile.y-1};
                if(map[getTileId(upTile)]) {
                    neighbors.push(upTile);
                }
            }
            if(tile.y < height-1) {
                var downTile = {x: tile.x, y: tile.y+1};
                if(map[getTileId(downTile)]) {
                    neighbors.push(downTile);
                }
            }
            return neighbors;
        }

        return {
            buildmap: function() {
                var actualbounds = Crafty.map.boundaries();
                bounds = {};
                bounds.min = {};
                bounds.max = {};
                bounds.min.x = Math.floor(actualbounds.min.x / gridsize) * gridsize;
                bounds.min.y = Math.floor(actualbounds.min.y / gridsize) * gridsize;
                bounds.max.x = Math.ceil(actualbounds.max.x / gridsize) * gridsize;
                bounds.max.y = Math.ceil(actualbounds.max.y / gridsize) * gridsize;
                width = (bounds.max.x - bounds.min.x) / gridsize;
                height = (bounds.max.y - bounds.min.y) / gridsize;

                for(var y = bounds.min.y; y < bounds.max.y; y += gridsize) {
                    for(var x = bounds.min.x; x < bounds.max.x; x += gridsize) {
                        var passable = false;
                        var rect = {_x: x, _y: y, _w: gridsize, _h: gridsize,
                                     x: x,  y: y,  w: gridsize,  h: gridsize};
                        var ents = Crafty.map.search(rect, true);
                        for(var i = 0; i < ents.length; i++) {
                            var collidingEntity = ents[i];

                            //Map.search searches by minimum bounding box,
                            // we need to search by collision bounding box
                            var colliding = true;
                            if(collidingEntity.map) {
                                var poly = new Crafty.polygon([[x, y],
                                    [x + gridsize, y],
                                    [x + gridsize, y + gridsize],
                                    [x, y + gridsize]]);
                                colliding = Util.SAT(collidingEntity.map, poly);
                            }

                            if(colliding) {
                                if(collidingEntity.has(groundComponent)) {
                                    passable = true;
                                } else if(collidingEntity.has(solidComponent)) {
                                    passable = false;
                                    break;
                                }
                            }
                        }
                        map.push(passable);
                    }
                }
            },

            render: function() {
                for(var y = 0; y < height; y++) {
                    for(var x = 0; x < width; x++) {
                        Crafty.e("2D, Canvas, Color")
                            .attr({x: x * gridsize + bounds.min.x, y: y * gridsize + bounds.min.y, w:2, h:2, z:1000})
                            .color(map[y * width + x] ? "#00FF00" : "#FF0000");
                    }
                }
            },

            findpath: function(start, end) {
                var startTile = {x: (start.x - bounds.min.x) / gridsize,
                                 y: (start.y - bounds.min.y) / gridsize};
                var endTile = { x: (end.x - bounds.min.x) / gridsize,
                                y: (end.y - bounds.min.y) / gridsize};

                var startTileId = getTileId(startTile);
                var endTileId = getTileId(endTile);

                if(!map[endTileId]) {
                    console.log("WARNING: endTile is no good");
                }
                var closedset = new Set();
                var openset = [startTile];
                var came_from = {};
                var g_scores = {};
                var h_scores = {};
                came_from[startTileId] = startTileId;
                g_scores[startTileId] = 0;
                h_scores[startTileId] = heuristic(startTile, endTile);

                while(openset.length > 0) {
                    var bestCostIndex = 0;
                    var bestCostTile = openset[bestCostIndex];
                    var bestCostTileId = getTileId(bestCostTile);
                    var bestCost = h_scores[bestCostTileId];
                    for(var i = 1; i < openset.length; i++) {
                        var tile = openset[i];
                        var tileId = getTileId(openset[bestCostIndex]);
                        var h_score = h_scores[tileId];
                        if(h_score < bestCost) {
                            bestCostIndex = i;
                            bestCostTile = tile;
                            bestCostTileId = tileId;
                            bestCost = h_score;
                        }
                    }

                    if(bestCostTileId == endTileId) {
                        return reconstruct_path(came_from, endTileId);
                    }

                    openset.splice(bestCostIndex, 1);
                    closedset.add(bestCostTileId);
                    var neighbors = get_neighbors(bestCostTile);

                    for(var i = 0; i < neighbors.length; i++) {
                        var neighbor = neighbors[i];
                        var neighborId = getTileId(neighbor);
                        if (closedset.has(neighborId)) {
                            continue;
                        }

                        var tentative_g_score = g_scores[bestCostTileId] + 1;
                        if(!(neighbor in openset) || tentative_g_score < g_scores[neighbor]) {
                            came_from[neighborId] = bestCostTileId;
                            g_scores[neighborId] = tentative_g_score;
                            h_scores[neighborId] = tentative_g_score + heuristic(neighbor, endTile);
                            openset.push(neighbor);
                        }
                    }
                }

                return [];
            },

        }
    }

    return pathfinder;
});
