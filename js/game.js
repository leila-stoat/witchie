/* global Phaser */
var loader = {
    preload : function() {
        //Load enemy information
        game.load.json("enemydb", "assets/guys.json", true);
        //Load puzzle spritesheet
        game.load.spritesheet("tilesheet","assets/tiles.png",Grid.tileSize,Grid.tileSize);
    },
    
    create: function() {
        //Reset current play data
        game.playData = {
            "enemy": 0
        };
        
        //Load score/gallery unlocks
        game.state.start('title');
    },
    
    update : function() { },
    render : function() { },
}

/* global Grid */
/* global Target */
var puzzleScene = {
    preload: function() {
    },
    
    create: function() {
        var grid_data = {
            size: {
                x: 8,
                y: 8
            }
        };
        
        var target_data = game.enemies[game.playData.enemy];
        
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
};

var titleScene = {
    create: function() {
        this.titleText = game.add.text(0, 0, "Wicked Witchie", {
            "font": "48px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.titleText.setTextBounds(0, 32, 400, 96);
        
        this.creditsText = game.add.text(0, 0, "A game by Leila Stoat", {
            "font": "12px Arial,sans-serif",
            "fill": Style.text.default.color,
            "fontVariant": "small-caps",
            "boundsAlignH": "center",
            "boundsAlignV": "bottom"
        });
        this.creditsText.setTextBounds(0, 0, 400, 400);
        
        this.startText = game.add.text(0, 0 + 12, "Start!", {
            "font": "18px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.startText.setTextBounds(0, 96+12, 400, 64);
        
        this.startText.inputEnabled = true;
        this.startText.events.onInputOver.add(highlight, this, 0, Style.text.highlight.color);
        this.startText.events.onInputOut.add(highlight, this, 0, Style.text.default.color);
        this.startText.events.onInputDown.add(onClickGoto, this, 0, "select");
        
    },
    
    update: function() {
    },
    
    render: function() {
    }
};

var modeScene = {
    "selectionAreaSize": 160,
    
    preload: function() {
        //Load enemy data and tiles
        game.enemies = game.cache.getJSON("enemydb");
        for(var i in game.enemies)
        {
            var enemy = game.enemies[i];
            game.load.spritesheet(enemy.name, "assets/" + enemy.sprite, 80, 80);
            if (enemy.tiles != undefined)
            {
                game.load.spritesheet(enemy.name  + " tilesheet", "assets/" + enemy.tiles, 32, 32);
            }
        }
    },
    
    create: function() {
        this.selectionArea = game.add.graphics((game.world.width - this.selectionAreaSize)/2, 80);
        this.enemyData = game.enemies[game.playData.enemy];
        
        this.selectionUI = {
            "portrait": game.add.sprite((this.selectionAreaSize - 80)/2, 0),
            "name": game.add.text(0, 0, "Name", {
                "font": "16px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            }),
            "title": game.add.text(0, 0, "Title", {
                "font": "12px Arial,sans-serif",
                "fill": Style.text.default.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            }),
            "prev": game.add.graphics(-36, 40 - 12),
            "next": game.add.graphics(92, 40 - 12),
            "start": game.add.text(0, 0, "Start!", {
                "font": "24px Arial,sans-serif",
                "fill": Style.text.default.color,
                "boundsAlignH": "center",
                "boundsAlignV": "top"
            })
        };
        
        this.selectionUI.portrait.frame = 0;
        this.selectionUI.name.setTextBounds(0, 88, this.selectionAreaSize, 16);
        this.selectionUI.title.setTextBounds(0, 108, this.selectionAreaSize, 12);
        
        this.selectionUI.next.beginFill(Style.color.default);
        this.selectionUI.next.drawPolygon([
            new Phaser.Point(4, 0),
            new Phaser.Point(20, 12),
            new Phaser.Point(4, 24)
            ]);
        this.selectionUI.next.endFill();
        this.selectionUI.next.inputEnabled = true;
        this.selectionUI.next.events.onInputOver.add(tint, this.selectionUI.next, 0, Style.color.highlight);
        this.selectionUI.next.events.onInputOut.add(tint, this.selectionUI.next, 0, Style.color.default);
        this.selectionUI.next.events.onInputDown.add(this.nextEnemy, this, 0);
        
        this.selectionUI.prev.beginFill(Style.color.default);
        this.selectionUI.prev.drawPolygon([
            new Phaser.Point(20, 0),
            new Phaser.Point(4, 12),
            new Phaser.Point(20, 24)
            ]);
        this.selectionUI.prev.endFill();
        this.selectionUI.prev.inputEnabled = true;
        this.selectionUI.prev.events.onInputOver.add(tint, this.selectionUI.next, 0, Style.color.highlight);
        this.selectionUI.prev.events.onInputOut.add(tint, this.selectionUI.next, 0, Style.color.default);
        this.selectionUI.prev.events.onInputDown.add(this.prevEnemy, this, 0);
        
        this.selectionUI.start.setTextBounds(0, 80 + this.selectionAreaSize, 400, 32);
        this.selectionUI.start.inputEnabled = true;
        this.selectionUI.start.events.onInputOver.add(highlight, this.selectionUI.start, 0, Style.text.highlight.color);
        this.selectionUI.start.events.onInputOut.add(highlight, this.selectionUI.start, 0, Style.text.default.color);
        this.selectionUI.start.events.onInputDown.add(onClickGoto, this.selectionUI.start, 0, "puzzle");
        
        this.selectionArea.addChild(this.selectionUI.portrait);
        this.selectionArea.addChild(this.selectionUI.name);
        this.selectionArea.addChild(this.selectionUI.title);
        this.selectionUI.portrait.addChild(this.selectionUI.next);
        this.selectionUI.portrait.addChild(this.selectionUI.prev);
        
        this.updateUI();
    },
    
    update: function() {
        
    },
    
    render: function() {
    
        
    },
    
    nextEnemy: function() {
        game.playData.enemy = game.playData.enemy + 1;
        if (game.playData.enemy >= game.enemies.length)
            game.playData.enemy = 0;
            
        this.enemyData = game.enemies[game.playData.enemy];
        this.updateUI();
    },
    
    prevEnemy: function() {
        game.playData.enemy = game.playData.enemy - 1;
        if (game.playData.enemy < 0)
            game.playData.enemy = game.enemies.length-1;
            
        this.enemyData = game.enemies[game.playData.enemy];
        this.updateUI();
    },
    
    updateUI: function() {
        this.selectionUI.portrait.loadTexture(this.enemyData.name, 0);
        this.selectionUI.name.text = this.enemyData.name;
        this.selectionUI.title.text = this.enemyData.title;
    }
};

var gameOverScene = {
    create: function() {
        if (game.playData.victory)
        {
            this.congrats = game.add.text(0,0, "CONGRATS!", {
                "font": "40px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center"
            });
            this.congrats.setTextBounds(0, 12, 400, 48);
            
            var enemyname = game.enemies[game.playData.enemy].name;
            this.finalText1 = game.add.text(0,0, "You have successfully transformed " + enemyname + " into", {
                "font": "14px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center",
                "boundsAlignV": "bottom"
            });
            this.finalText1.setTextBounds(64, 64, 400-128, 64);
            
            this.portrait = game.add.sprite((400-80)/2, 144, enemyname);
            this.portrait.frame = game.playData.tf.sprite;
            
            this.tfname = game.add.text(0, 0, game.playData.tf.name, {
                "font": "16px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            });
            this.tfname.setTextBounds(0, 226, 400, 20);
            
            this.tftitle = game.add.text(0, 0, game.playData.tf.title, {
                "font": "12px Arial,sans-serif",
                "fill": Style.text.default.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            });
            this.tftitle.setTextBounds(0, 248, 400, 12);
        }
        else
        {
            this.ohno = game.add.text(0,0, "OH NOES!", {
                "font": "40px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center"
            });
            this.ohno.setTextBounds(0, 12, 400, 48);
            
            var enemyname = game.enemies[game.playData.enemy].name;
            this.finalText1 = game.add.text(0,0, "You have failed to transform " + enemyname + " at all!", {
                "font": "14px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center",
                "boundsAlignV": "bottom"
            });
            this.finalText1.setTextBounds(64, 64, 400-128, 64);
            
            this.portrait = game.add.sprite((400-80)/2, 144, enemyname);
        }
        
        this.tryagain = game.add.text(0, 0, "Have fun trying again!", {
            "font": "12px Arial,sans-serif",
            "fill": Style.text.default.color,
            "fontVariant": "small-caps",
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.tryagain.setTextBounds(96, 400-32, 400-192, 24);
        this.tryagain.inputEnabled = true;
        this.tryagain.events.onInputOver.add(highlight, this.tryagain, 0, Style.text.highlight.color);
        this.tryagain.events.onInputOut.add(highlight, this.tryagain, 0, Style.text.default.color);
        this.tryagain.events.onInputDown.add(onClickGoto, this.tryagain, 0, "select");
    },
    
    update: function() {
    },
    
    render: function() {
    }
};

var game = new Phaser.Game(400, 400, Phaser.CANVAS, 'witch-game', loader, true);
game.state.add('puzzle', puzzleScene);
game.state.add('title', titleScene);
game.state.add('select', modeScene);
//game.state.add('gallery', galleryScene);
game.state.add('gameOver', gameOverScene);