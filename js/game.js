/* global Phaser */
var game = new Phaser.Game(480, 640, Phaser.CANVAS, 'witch-game', {
    preload: function() {
        game.load.spritesheet("tilesheet","assets/tiles.png",Grid.tileSize,Grid.tileSize);
        
        game.load.spritesheet("guysheet0","assets/ericgeneric.png",80,80);  
    },
    
    create: function() {
        var grid_data = {
            size: {
                x: 8,
                y: 8
            }
        };
        
        var target_data = {
            hp: 100,
            sprite: 'guysheet0',
            time: 90,
            transform: {
                'red': 1,
                'magenta': 2,
                'blue': 3,
                'green': 4,
                'violet': 5
            },
            damage: {
            }
        }
        
        game.enemy = new Target(target_data);
        game.grid = new Grid(grid_data);
    },
    
    update: function() {
        var dt = game.time.elapsedMS/1000;
        game.grid.update(dt);
        game.enemy.update(dt);
    },
    
    render: function() {
        
    }
});