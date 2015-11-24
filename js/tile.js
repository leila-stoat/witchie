//The tiles that form the game grid
//Args:
// - sheet: tilesheet for this tile
// - tile: face image of the tile(index)
// - type: match type of the tile
// - position: position in grid(contains x and y)
function Tile(data)
{
    if (data.tile == undefined) data.tile = 0;
    if (data.sheet == undefined) data.sheet = 'tilesheet';
    
    this.X = data.position.x;
    this.Y = data.position.y;
    this.deltaX = 0;
    this.deltaY = 0;
    
    this.sprite = game.add.sprite(this.X*Grid.tileSize, this.Y*Grid.tileSize, data.sheet);
    this.sprite.frame = data.tile;
    this.matchType = data.type;
    if (this.matchType.color != undefined) this.sprite.tint = this.matchType.color;
    
    this.selected = false;
    
    this.update = function(dt) {
        this.sprite.position.x = (this.X + this.deltaX)*Grid.tileSize;
        this.sprite.position.y = (this.Y + this.deltaY)*Grid.tileSize;
    };
    
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(function() {
        if (!game.grid.enabled) return;
        
        this.selected = !this.selected;
        game.grid.select(this.X, this.Y);
    }, this);
    
    this.moveTo = function(x, y) {
        this.X = x;
        this.Y = y;
        this.deltaX = 0;
        this.deltaY = 0;
    }
    
    this.addDelta = function(dx, dy) {
        this.deltaX += dx;
        this.deltaY += dy;
    }
}

//Match Type enumeration
var MatchTypes = {
    red: { name:'red', color: 0xff0000 },
    yellow: { name:'yellow', color: 0xffff00 },
    green: { name:'green', color: 0x00ff00 },
    blue: { name:'blue', color: 0x0000ff },
    violet: { name:'violet', color: 0x8000ff },
    magenta: { name:'magenta', color: 0xff0080 },
    black: { name:'black', color: 0x404040 },
    white: { name:'white', color: 0xffffff }
};
var keys = [];
for (t in MatchTypes) keys.push(t);
MatchTypes.types = keys;
MatchTypes.getRandom = function () {
    return this[this.types[Math.floor(Math.random() * this.types.length)]];
}
