/* global Phaser */
var loader = {
    preload : function() {
        game.load.enableParallel = false;
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
        
        game.state.start("enemyLoader");
    },
    
    update : function() { },
    render : function() { },
}

var enemyLoader = {
    preload : function() {
        //Load enemy data and tiles
        game.enemies = game.cache.getJSON("enemydb");
        game.load.onLoadComplete.addOnce(function() { game.state.start('title'); }, this);
        
        for(var i in game.enemies)
        {
            var enemy = game.enemies[i];
            console.log(enemy);
            game.load.spritesheet(enemy.name, "assets/" + enemy.sprite, 150, 150);
            if (enemy.tiles != undefined)
            {
                game.load.spritesheet(enemy.name  + " tilesheet", "assets/" + enemy.tiles, 32, 32);
            }
        }
        
        //Load Sissydex
        if (game.sissydex == undefined) {
            game.sissydex = {};
            game.sissydex.boyOrder = [];
            game.sissydex.colorOrder = ["black","white","red","blue","green","yellow","magenta","violet"];
            
            for(var i in game.enemies)
            {
                var boy = game.enemies[i];
                game.sissydex.boyOrder.push(boy.name);
                game.sissydex[boy.name] = {
                    'boy': {
                        'name': boy.name,
                        'title': boy.title,
                        'quote': boy.quote,
                        'blurb': boy.blurb
                    }
                };
                
                for (var color in game.sissydex.colorOrder)
                {
                    if (game.sissydex.colorOrder[color] == boy.transform.default)
                    {
                        game.sissydex[boy.name].defaultSissy = parseInt(color);
                        break;
                    }
                }
            
                game.sissydex[boy.name].sissies = {};
                game.sissydex.colorOrder.forEach((color) =>
                {
                    if (boy.transform[color] != undefined)
                    {
                        var sissy = boy.transform[color];
                        game.sissydex[boy.name].sissies[color] = {
                            "sprite": sissy.sprite,
                            "name": sissy.name,
                            "title": sissy.title,
                            "quote": sissy.quote,
                            "blurb": sissy.blurb,
                            "found": false
                        };
                    }
                });
            }
            
            console.log("SissyDex ready!");
            console.log(game.sissydex);
        }
    },
    
    create: function() {
        game.state.start("title");
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
            x: 0,
            y: 16,
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
        this.titleText.setTextBounds(0, 32, game.world.width, 96);
        
        this.creditsText = game.add.text(0, 0, "A game by Leila Stoat", {
            "font": "12px Arial,sans-serif",
            "fill": Style.text.default.color,
            "fontVariant": "small-caps",
            "boundsAlignH": "center",
            "boundsAlignV": "bottom"
        });
        this.creditsText.setTextBounds(0, 0, game.world.width, game.world.height);
        
        this.startText = game.add.text(0, 0 + 12, "Select Your Victim", {
            "font": "24px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.startText.setTextBounds(0, 96+12, game.world.width, 64);
        
        this.startText.inputEnabled = true;
        this.startText.events.onInputOver.add(highlight, this, 0, Style.text.highlight.color);
        this.startText.events.onInputOut.add(highlight, this, 0, Style.text.default.color);
        this.startText.events.onInputDown.add(onClickGoto, this, 0, "select");
        
        this.galleryText = game.add.text(0, 0 + 12, "Gallery", {
            "font": "24px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.galleryText.setTextBounds(0, 160+12, game.world.width, 64);
        
        this.galleryText.inputEnabled = true;
        this.galleryText.events.onInputOver.add(highlight, this, 0, Style.text.highlight.color);
        this.galleryText.events.onInputOut.add(highlight, this, 0, Style.text.default.color);
        this.galleryText.events.onInputDown.add(onClickGoto, this, 0, "gallery");
        
    },
    
    update: function() {
    },
    
    render: function() {
    }
};

var modeScene = {
    "selectionAreaSize": 300,
    create: function() {
        this.selectionArea = game.add.graphics((game.world.width - this.selectionAreaSize)/2, 100);
        this.enemyData = game.enemies[game.playData.enemy];
        
        this.selectionUI = {
            "portrait": game.add.sprite((this.selectionAreaSize - 150)/2, 0),
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
            "prev": game.add.graphics(-36, 150*3/4 - 12),
            "next": game.add.graphics(150+12, 150*3/4 - 12),
            "start": game.add.text(0, 0, "Start!", {
                "font": "24px Arial,sans-serif",
                "fill": Style.text.default.color,
                "boundsAlignH": "center",
                "boundsAlignV": "top"
            }),
            "back": game.add.text(0, 0, "Back", {
                "font": "16px Arial,sans-serif",
                "fill": Style.text.default.color,
                "boundsAlignH": "center",
                "boundsAlignV": "bottom"
            })
        };
        
        this.selectionUI.portrait.frame = 0;
        this.selectionUI.name.setTextBounds(0, 158, this.selectionAreaSize, 16);
        this.selectionUI.title.setTextBounds(0, 178, this.selectionAreaSize, 12);
        
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
        this.selectionUI.prev.events.onInputOver.add(tint, this.selectionUI.prev, 0, Style.color.highlight);
        this.selectionUI.prev.events.onInputOut.add(tint, this.selectionUI.prev, 0, Style.color.default);
        this.selectionUI.prev.events.onInputDown.add(this.prevEnemy, this, 0);
        
        this.selectionUI.start.setTextBounds(0, 150 + this.selectionAreaSize, game.world.width, 32);
        this.selectionUI.start.inputEnabled = true;
        this.selectionUI.start.events.onInputOver.add(highlight, this.selectionUI.start, 0, Style.text.highlight.color);
        this.selectionUI.start.events.onInputOut.add(highlight, this.selectionUI.start, 0, Style.text.default.color);
        this.selectionUI.start.events.onInputDown.add(onClickGoto, this.selectionUI.start, 0, "puzzle");
        
        this.selectionUI.back.setTextBounds(0, game.world.height - 48, game.world.width, 32);
        this.selectionUI.back.inputEnabled = true;
        this.selectionUI.back.events.onInputOver.add(highlight, this.selectionUI.back, 0, Style.text.highlight.color);
        this.selectionUI.back.events.onInputOut.add(highlight, this.selectionUI.back, 0, Style.text.default.color);
        this.selectionUI.back.events.onInputDown.add(onClickGoto, this.selectionUI.back, 0, "title");
        
        
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
            this.congrats.setTextBounds(0, 12, game.world.width, 48);
            
            var enemyname = game.enemies[game.playData.enemy].name;
            this.finalText1 = game.add.text(0,0, "You have successfully transformed " + enemyname + " into...", {
                "font": "14px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center",
                "boundsAlignV": "bottom"
            });
            this.finalText1.setTextBounds(64, 64, game.world.width-128, 64);
            
            this.portrait = game.add.sprite((game.world.width-150)/2, 144, enemyname);
            this.portrait.frame = game.playData.tf.sprite;
            
            this.tfquote = game.add.text(0, 0, game.playData.tf.quote, {
                "font": "12px Arial,sans-serif",
                "fill": Style.text.default.color,
                "fontStyle": "italic",
                "wordWrap": true,
                "wordWrapWidth": 150,
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            });
            this.tfquote.setTextBounds(0, 300, game.world.width, 32);
            
            
            this.tfname = game.add.text(0, 0, game.playData.tf.name, {
                "font": "16px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            });
            this.tfname.setTextBounds(0, 340, game.world.width, 20);
            
            this.tftitle = game.add.text(0, 0, game.playData.tf.title, {
                "font": "12px Arial,sans-serif",
                "fill": Style.text.default.color,
                "fontVariant": "small-caps",
                "boundsAlignH": "center",
                "boundsAlignV": "middle"
            });
            this.tftitle.setTextBounds(0, 360, game.world.width, 12);
        }
        else
        {
            this.ohno = game.add.text(0,0, "OH NOES!", {
                "font": "40px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center"
            });
            this.ohno.setTextBounds(0, 12, game.world.width, 48);
            
            var enemyname = game.enemies[game.playData.enemy].name;
            this.finalText1 = game.add.text(0,0, "You have failed to transform " + enemyname + " at all!", {
                "font": "14px Arial,sans-serif",
                "fill": Style.text.highlight.color,
                "boundsAlignH": "center",
                "boundsAlignV": "bottom"
            });
            this.finalText1.setTextBounds(64, 64, game.world.width-128, 64);
            
            this.portrait = game.add.sprite((game.world.width-150)/2, 144, enemyname);
        }
        
        this.tryagain = game.add.text(0, 0, "Have fun trying again!", {
            "font": "12px Arial,sans-serif",
            "fill": Style.text.default.color,
            "fontVariant": "small-caps",
            "boundsAlignH": "center",
            "boundsAlignV": "middle"
        });
        this.tryagain.setTextBounds(96, game.world.height-32, game.world.width-192, 24);
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

var galleryScene = {
    preload: function() {
        this.boyIndex = 0;
        this.getDefaultSissy();
    },
    
    getDefaultSissy: function() {
        this.sissyIndex = game.sissydex[game.sissydex.boyOrder[this.boyIndex]].defaultSissy;
    },
    
    createPane: function(x, y, prev, next) {
        var area = game.add.graphics(x, y);
        var portrait = game.add.sprite(0, 200-150-16);
        
        var prevButton = game.add.graphics(0, 150);
        prevButton.beginFill(Style.color.default);
        prevButton.drawPolygon([
            new Phaser.Point(0, 8),
            new Phaser.Point(16, 16),
            new Phaser.Point(16, 0)
            ]);
        prevButton.endFill();
        prevButton.inputEnabled = true;
        prevButton.events.onInputOver.add(tint, prevButton, 0, Style.color.highlight);
        prevButton.events.onInputOut.add(tint, prevButton, 0, Style.color.default);
        prevButton.events.onInputDown.add(prev, this, 0);
        
        var nextButton = game.add.graphics(150-16, 150);
        nextButton.beginFill(Style.color.default);
        nextButton.drawPolygon([
            new Phaser.Point(16, 8),
            new Phaser.Point(0, 16),
            new Phaser.Point(0, 0)
            ]);
        nextButton.endFill();
        nextButton.inputEnabled = true;
        nextButton.events.onInputOver.add(tint, nextButton, 0, Style.color.highlight);
        nextButton.events.onInputOut.add(tint, nextButton, 0, Style.color.default);
        nextButton.events.onInputDown.add(next, this, 0);
        
        var textArea = game.add.graphics(150, 16);
        
        var nameText = game.add.text(0, 0, "NAME", {
            "font": "16px Arial,sans-serif",
            "fill": Style.text.highlight.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle",
        });
        var titleText = game.add.text(0, 0, "TITLE", {
            "font": "14px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle",
        });
        var quoteText = game.add.text(0, 0, "QUOTE", {
            "font": "12px Arial,sans-serif",
            "fontStyle": "italic",
            "fill": Style.text.default.color,
            "wordWrap": true,
            "wordWrapWidth": 200,
            "boundsAlignH": "center",
            "boundsAlignV": "middle",
        });
        var blurbText = game.add.text(0, 0, "BLURB", {
            "font": "12px Arial,sans-serif",
            "fill": Style.text.default.color,
            "wordWrap": true,
            "wordWrapWidth": 400,
            "boundsAlignH": "center",
            "boundsAlignV": "middle",
        });
        
        nameText.setTextBounds(0, 0, 400, 16);
        titleText.setTextBounds(0, 16, 400, 16);
        quoteText.setTextBounds(0, 32, 400, 32);
        blurbText.setTextBounds(0, 64, 400, 200-64-16);
        
        portrait.addChild(prevButton);
        portrait.addChild(nextButton);
        
        textArea.addChild(nameText);
        textArea.addChild(titleText);
        textArea.addChild(quoteText);
        textArea.addChild(blurbText);
        
        area.addChild(portrait);
        area.addChild(textArea);
        
        return {
            "area": area,
            "portrait": portrait,
            "textArea": textArea,
            "name": nameText,
            "title": titleText,
            "quote": quoteText,
            "blurb": blurbText
        }
    },
    
    updatePane: function(pane, source) {
        if (source.sprite == undefined) source.sprite = 0;
        
        pane.portrait.loadTexture(source.spriteName, source.sprite);
        pane.name.text = source.name;
        pane.title.text = source.title;
        pane.quote.text = '"' + source.quote + '"';
        pane.blurb.text = source.blurb;
    },
    
    create: function() {
        this.sissydex = game.add.graphics(0, 0);
        
        this.title = game.add.text(0, 0, "SissyPedia", {
            "font": "24px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "middle",
            "variant": "small-caps"
        });
        this.title.setTextBounds(0, 0, game.world.width, 32);
        
        this.boyArea = this.createPane(8, 32, this.prevBoy, this.nextBoy)
        this.sissyArea = this.createPane(8, 300, this.prevSissy, this.nextSissy);

        this.updateDexEntry();
        
        this.backLink = game.add.text(0, 0, "Back", {
            "font": "16px Arial,sans-serif",
            "fill": Style.text.default.color,
            "boundsAlignH": "center",
            "boundsAlignV": "bottom"
        });
        this.backLink.setTextBounds(0, game.world.height - 48, game.world.width, 32);
        this.backLink.inputEnabled = true;
        this.backLink.events.onInputOver.add(highlight, this.backLink, 0, Style.text.highlight.color);
        this.backLink.events.onInputOut.add(highlight, this.backLink, 0, Style.text.default.color);
        this.backLink.events.onInputDown.add(onClickGoto, this.backLink, 0, "title");
    },
    
    update: function() {
    },
    
    render: function() {
    },
    
    updateDexEntry: function() {
        var boyName = game.sissydex.boyOrder[this.boyIndex];
        
        var sissyColor = game.sissydex.colorOrder[this.sissyIndex];
        console.log(boyName, sissyColor);
        
        var sprite = game.cache.getImage(boyName);
        
        var boyEntry = game.sissydex[boyName].boy;
        boyEntry.spriteName = boyEntry.name;
        
        console.log(boyEntry);
        this.updatePane(this.boyArea, boyEntry);
        /*this.boyArea.portrait.loadTexture(boyName, 0);
        this.boyArea.name.text = boyEntry.name;
        this.boyArea.title.text = boyEntry.title;
        this.boyArea.quote.text = '"' + boyEntry.quote + '"';
        this.boyArea.blurb.text = boyEntry.blurb;*/
    
        var sissyEntry = game.sissydex[boyName].sissies[sissyColor];
        if (!game.sissydex[boyName].sissies[sissyColor].found)
        {
            sissyEntry = {
                "name": "???",
                "title": "???",
                "quote": "...",
                "blurb": "<SISSY UNKNOWN>",
                "sprite": sissyEntry.sprite
            };
        }
        sissyEntry.spriteName = boyEntry.name;
        
        
        console.log(sissyEntry);
        this.updatePane(this.sissyArea, sissyEntry);
        //this.sissyArea.portrait.loadTexture(boyName, sissyEntry.sprite);
        if (game.sissydex[boyName].sissies[sissyColor].found)
        {
            this.sissyArea.portrait.tint = 0xffffff;
        }
        else
        {
            this.sissyArea.portrait.tint = 0x000000;
        }
        
    },
    
    nextBoy: function() {
        this.boyIndex += 1;
        if (this.boyIndex >= game.sissydex.boyOrder.length)
            this.boyIndex -= game.sissydex.boyOrder.length;
        this.getDefaultSissy();
        
        this.updateDexEntry();
    },
    
    prevBoy: function() {
        this.boyIndex -= 1;
        if (this.boyIndex < 0)
            this.boyIndex += game.sissydex.boyOrder.length;
        this.getDefaultSissy();
        
        this.updateDexEntry();
    },
    
    nextSissy: function() {
        var boyData = game.sissydex[game.sissydex.boyOrder[this.boyIndex]];
        console.log(this.sissyIndex);
        do {
            this.sissyIndex += 1;
            if (this.sissyIndex >= game.sissydex.colorOrder.length)
                this.sissyIndex -= game.sissydex.colorOrder.length;
            console.log(this.sissyIndex);
        } while (boyData.sissies[game.sissydex.colorOrder[this.sissyIndex]] == undefined);
        
        this.updateDexEntry();
    },
    
    prevSissy: function() {
        var boyData = game.sissydex[game.sissydex.boyOrder[this.boyIndex]];
        do {
            this.sissyIndex -= 1;
            if (this.sissyIndex < 0)
                this.sissyIndex += game.sissydex.colorOrder.length;
        } while (boyData.sissies[game.sissydex.colorOrder[this.sissyIndex]] == undefined);
        
        this.updateDexEntry();
    }
}

var game = new Phaser.Game(600, 600, Phaser.CANVAS, 'witch-game', loader, true);
game.state.add('enemyLoader', enemyLoader);
game.state.add('puzzle', puzzleScene);
game.state.add('title', titleScene);
game.state.add('select', modeScene);
game.state.add('gallery', galleryScene);
game.state.add('gameOver', gameOverScene);