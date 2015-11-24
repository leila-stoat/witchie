/* global Phaser */
var game = new Phaser.Game(480, 640, Phaser.CANVAS, 'witch-game', {
    preload: function() {
        game.load.spritesheet("tilesheet","assets/tiles.png",Grid.tileSize,Grid.tileSize);
        
        game.load.spritesheet("guysheet0","assets/guygeneric.png",80,80);  
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
                'magenta': 2
            },
            damage: {
                'magenta': 2,
                'black': 0.5
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
