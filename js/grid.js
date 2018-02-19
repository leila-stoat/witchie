//The game grid itself
//Args:
// - size: dimensions of the grid(in tiles)(contains x and y)
function Grid(data)
{
    Grid.tileSize = 32;
    
    var gridX = data.x + ((game.world.width - data.size.x * Grid.tileSize) / 2);
    var gridY = data.y + ((game.world.height - data.size.y * Grid.tileSize) / 2);
    this.space = game.add.graphics(gridX, gridY);
    this.width = data.size.x;
    this.height = data.size.y;
    
    this.enabled = true;
    
    this.clock = game.time.create(false);
    this.clock.start();
    this.events = new EventQueue();
    
    this.gameOver = false;
    
    this.update = function(dt) {
        if (this.events.queue.length > 0)
            this.events.update(dt);
            
        this.enabled = this.events.queue.length == 0;
        
        for (var x = 0; x < this.width; x++)
        {
            for (var y = 0; y < this.height; y++)
            {
                if (this.grid[x][y] != undefined) this.grid[x][y].update(dt);
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
        if (!this.enabled || this.gameOver) return;
        
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
                var tile1 = this.selected;
                var tile2 = this.grid[x][y];
                this.events.add([
                    new EventTranslate(tile1, tile2.X-tile1.X, tile2.Y-tile1.Y, 0.25),
                    new EventTranslate(tile2, tile1.X-tile2.X, tile1.Y-tile2.Y, 0.25)
                ]);
                this.selected = undefined;
                
                this.events.add(new EventCheckMatches(this, 0.1));
                this.events.add([
                    new EventTranslate(tile1, tile1.X-tile2.X, tile1.Y-tile2.Y, 0.25),
                    new EventTranslate(tile2, tile2.X-tile1.X, tile2.Y-tile1.Y, 0.25)
                ]); //This event set will be removed if there are matches
            }
        }
    }
    
    //Add new tile
    this.addTile = function(x, y) {
        var newTile = new Tile({
            position: {x: x, y: y},
            type: MatchTypes.getRandom(game.enemy.transTable),
            sheet: game.enemy.name + " tilesheet",
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

//Move tile from its initial position to the specified position over time(in seconds)
function EventTranslate(tile, x, y, time, clean)
{
    if (clean == undefined) clean = false;
    
    this.time = time;
    this.tile = tile;
    this.total_time = time;
    this.clean = clean;
    
    this.delta = {
        x: x,
        y: y
    };
    
    this.update = function(dt)
    {
        this.tile.addDelta(dt/this.total_time * this.delta.x, dt/this.total_time * this.delta.y);
    };
    
    this.end = function()
    {
        if (clean)
            game.grid.grid[this.tile.X][this.tile.Y] = undefined;
            
        var destination = {
            x: tile.X + x,
            y: tile.Y + y
        };
        
        this.tile.moveTo(destination.x, destination.y);
        game.grid.grid[destination.x][destination.y] = this.tile;
    };
}

//Erase tile by fading over time(in seconds)
function EventErase(tile, time)
{
    this.time = time;
    this.tile = tile;
    this.total_time = time;
    
    this.update = function(dt) {
        this.tile.sprite.alpha = this.time/this.total_time;
    };
    
    this.end = function() {
        game.grid.grid[tile.X][tile.Y] = undefined;
    };
}

//Erase tile by fading over time(in seconds)
function EventCreate(x, y, grid, time)
{
    this.time = time;
    this.total_time = time;
    
    this.grid = grid;
    
    this.tile = grid.addTile(x, y);
    this.tile.sprite.alpha = 0;
    this.grid.grid[x][y] = this.tile;
    
    this.update = function(dt) {
        this.tile.sprite.alpha = (this.total_time - this.time)/this.total_time;
    };
    
    this.end = function() {
        this.tile.sprite.alpha = 1;
    };
}

//Check and mark grid matches
function EventCheckMatches(grid, delay)
{
    this.time = delay;
    this.grid = grid;
    
    this.update = function(dt) {
        if (this.matches == undefined)
        {
            this.matches = this.grid.matches();
        }
    };
    
    this.end = function() {
        if (this.matches.length > 0)
        {
            this.grid.events.discard();
            
            var eraseTiles = [];
            for (var m in this.matches)
            {
                game.enemy.events.add(new EventDamage(this.matches[m].length, this.matches[m][0].matchType));
                
                for (var i in this.matches[m])
                {
                    eraseTiles.push(new EventErase(this.matches[m][i], 0.25));
                }
            }
            
            grid.events.add(eraseTiles);
            grid.events.add(new EventReorganize(this.grid));
        }
    };
}

//Reorganize grid
function EventReorganize(grid)
{
    this.time = 0;
    this.grid = grid;
    
    this.update = function(dt) {};
    
    this.end = function()
    {
        var colShiftEvents = [];
        for(var x=0; x < this.grid.grid.length; x++)
        {
            var col = this.grid.grid[x];
            var y = col.length-1;
            while (col[y] != undefined && y >= 0) y--;
            
            if (y < 0) continue;
            
            var ty = y-1;
            while(ty >= 0)
            {
                while(ty >= 0 && col[ty] == undefined)
                {
                    ty--;
                }
                if (ty < 0) continue;
                colShiftEvents.push(new EventTranslate(col[ty], 0, y-ty, (y-ty)*0.125, true));
                ty--;
                y--;
            }
        }
        this.grid.events.add(colShiftEvents);
        this.grid.events.add(new EventRefill(this.grid));
    };
}

//Refill grid
function EventRefill(grid)
{
    this.time = 0;
    this.grid = grid;
    
    this.update = function(dt) {};
    
    this.end = function()
    {
        var createEvents = [];
        for(var x=0; x < this.grid.grid.length; x++)
        {
            for(var y=0; y < this.grid.grid[x].length; y++)
            {
                if (this.grid.grid[x][y] != undefined) break;
                
                createEvents.push(new EventCreate(x, y, this.grid, 0.2));
            }
        }
        
        grid.events.add(createEvents);
        if (!this.gameOver)
            grid.events.add(new EventCheckMatches(this.grid, 0.1));
    }
}