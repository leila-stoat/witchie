//The game grid itself
//Args:
// - size: dimensions of the grid(in tiles)(contains x and y)
function Grid(data)
{
    Grid.tileSize = 32;
    
    this.space = game.add.graphics((game.world.width - data.size.x * Grid.tileSize) / 2, (game.world.height - data.size.y * Grid.tileSize) / 2);
    this.width = data.size.x;
    this.height = data.size.y;
    
    this.enabled = true;
    this.clock = game.time.create(false);
    this.clock.start();
    
    this.update = function(dt) {
        for (var x = 0; x < this.width; x++)
        {
            for (var y = 0; y < this.height; y++)
            {
                this.grid[x][y].update(dt);
            }
        }
        this.selectBox.visible = (this.selected != undefined);
    };
    
    //Returns all the matches found in the grid
    this.matches = function() {
        var _matches = [];
        
        //Inspect all columns
        for (var x = 0; x < this.width; x++)
        {
            for (var y = 0; y < this.height; y++)
            {
                var colMatch = [];
                colMatch.push(this.grid[x][y]);
                while (y < this.height-1 && this.grid[x][y].matchType == this.grid[x][y+1].matchType)
                {
                    colMatch.push(this.grid[x][y+1]);
                    
                    y = y + 1;
                }
                
                if (colMatch.length >= 3) _matches.push(colMatch);
            }
        }
        
        //Inspect all lines
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                var lineMatch = [];
                lineMatch.push(this.grid[x][y]);
                while (x < this.width-1 && this.grid[x][y].matchType == this.grid[x+1][y].matchType)
                {
                    lineMatch.push(this.grid[x+1][y]);
                    
                    x = x + 1;
                }
                
                if (lineMatch.length >= 3) _matches.push(lineMatch);
            }
        }
        
        return _matches;
    }
    
    this.selectBox = game.add.graphics(0, 0);
    this.space.addChild(this.selectBox);
    this.selected = undefined;
    this.select = function(x, y)
    {
        if (!this.enabled) return;
        
        if (this.selected == undefined)
        {
            this.selected = this.grid[x][y];
            this.selectBox.position = this.selected.sprite.position;
        }
        else
        {
            if (this.selected == this.grid[x][y])
            {
                this.selected = undefined;
            }
            else
            {
                this.enabled = false;
                var temp = this.grid[x][y];
                this.swap(this.selected, this.grid[x][y]);
                this.clock.add(1000, function() {
                    this.selected.selected = false;
                    this.selected = temp;
                    
                    var M = this.matches();
                    if (M.length > 0)
                        this.processMatches(M);
                    else
                    {
                        this.swap(this.selected, this.grid[x][y]);
                        this.clock.add(1000, function() {
                            this.enabled = true;
                        }, this);
                    }
                    
                    if (this.selected != undefined)
                    this.selected = undefined;
                }, this);
            }
        }
    }
    
    //Evaluate matches
    this.processMatches = function(matches) {
        var timerOffset = 0;
        for (var i in matches)
        {
            var M = matches[i];
            //Analyze match and damage enemy
            this.clock.add(timerOffset + 25, game.enemy.damage, game.enemy, M.length, M[0].matchType.name);
        
            for(var x in M)
            {
                var tile = M[x];
                if (tile.sprite.alive)
                {
                    this.clock.add(timerOffset + 25, tile.sprite.kill, tile.sprite);
                    timerOffset += 25;
                }
            }
        }
        this.clock.add(timerOffset+100, this.reorganize, this);
    }
    
    //Reorganize tiles
    this.reorganize = function() {
        var timerOffset = 0;
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                var tile = this.grid[x][y];
                if (!tile.sprite.alive)
                {
                    tile.sprite.destroy();
                    this.clock.add(timerOffset + 50, this.columnFall, this, x, y);
                    timerOffset += 50;
                }
            }
        }
        
        this.clock.add(timerOffset + 50, function() {
            var M = this.matches();
            if (M.length > 0)
                this.processMatches(M);
            else
                this.enabled = true;
        }, this);
    }
    
    this.columnFall = function(x, y)
    {
        for (var u = y-1; u >= 0; u--)
        {
            this.grid[x][u+1] = this.grid[x][u];
            this.grid[x][u+1].moveTo(x,u+1);
        }
        this.grid[x][0] = this.addTile(x,0);
    }
    
    //Swap two tiles
    this.swap = function(T1, T2) {
        var dx = T2.X-T1.X;
        var dy = T2.Y-T1.Y;
        
        for(var t = 50; t <= 500; t += 50)
        {
            this.clock.add(t, T1.addDelta, T1, dx/10, dy/10);
            this.clock.add(t, T2.addDelta, T2, -dx/10, -dy/10);
        }
        this.clock.add(500, function() {
            var tX = T1.X;
            var tY = T1.Y;
            
            this.grid[T1.X][T1.Y] = T2;
            this.grid[T2.X][T2.Y] = T1;
            
            T1.moveTo(T2.X, T2.Y);
            T2.moveTo(tX, tY);
        }, this);
    }
    
    //Add new tile
    this.addTile = function(x, y) {
        var newTile = new Tile({
            position: {x: x, y: y},
            type: MatchTypes.getRandom()
        });
        this.space.addChild(newTile.sprite);
        return newTile;
    }
    
    //Re-generate the grid until it has no matches
    this.grid = [];
    for(var x = 0; x < this.width; x++)
    {
        var col = [];
        for(var y = 0; y < this.height; y++)
        {
            col.push(this.addTile(x,y));
        }
        this.grid.push(col);
    }
    this.processMatches(this.matches());
    
    /*while(this.matches().length > 0)
    {
        var M = this.matches();
        for (var i in M)
        {
            var m = M[i];
            for (var t in m)
            {
                m[t].type = MatchTypes.getRandom();
            }
        }
    }*/
    
    //Create selection cursor
    this.selectBox.beginFill(0xffffff, 0.5);
    this.selectBox.drawPolygon(0, 8, 0, 0, 8, 0);
    this.selectBox.drawPolygon(0, Grid.tileSize-8, 0, Grid.tileSize, 8, Grid.tileSize);
    this.selectBox.drawPolygon(Grid.tileSize, 8, Grid.tileSize, 0, Grid.tileSize-8, 0);
    this.selectBox.drawPolygon(Grid.tileSize, Grid.tileSize-8, Grid.tileSize, Grid.tileSize, Grid.tileSize-8, Grid.tileSize);
    this.selectBox.endFill();
    this.selectBox.visible = false;
}