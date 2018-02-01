//The target that'll be hit
//Args:
// - hp: Hit Points, of course
// - name: spritesheet identifier of the target(check doc)
// - time: total time to defeat the target
// - transform: transformation table(for defeat)
// - damage: type match table(damage multipliers)
function Target(data)
{
    Target.imgSize = 80;
    
    this.name = data.name;
    this.space = game.add.graphics(game.world.width/2 - Target.imgSize/2, 16);
    this.sprite = game.add.sprite(0, 0, data.name);
    this.sprite.scale.x = Target.imgSize/this.sprite.width;
    this.sprite.scale.y = Target.imgSize/this.sprite.height;
    this.sprite.frame = 0;
    
    this.transTable = data.transform;
    this.typeMult = data.damage;
    
    this.events = new EventQueue();
    
    Target.fontStyle = {
        "label": {
            "font": "12px Arial,sans-serif",
            "fontVariant": "small-caps",
            "fontWeight": "bold",
            "boundsAlignH": "right",
            "boundsAlignV": "middle"
        },
        "header": {
            "font": "12px Arial,sans-serif",
            "fontVariant": "small-caps",
            "fontWeight": "bold",
            "boundsAlignH": "left",
            "boundsAlignV": "middle"
        }
    };
    
    this.totalTime = data.time;
    this.time = 0;
    this.timeBar = game.add.graphics(0, -12);
    this.timeBar.beginFill(0x00c0ff);
    this.timeBar.drawRect(0, 0, Target.imgSize, 8);
    this.timeBar.endFill();
    this.timeLabel = game.add.text(0, 0, "Time", Target.fontStyle.label);
    this.timeLabel.setTextBounds(-26, -12, 24, 12);
    this.timeLabel.fill = Style.text.default.color;
    
    this.hp = data.hp;
    this.maxHP = data.hp;
    this.hpBar = game.add.graphics(0, Target.imgSize+4);
    this.hpBar.beginFill(0x808080);
    this.hpBar.drawRect(0, 0, Target.imgSize, 8);
    this.hpBar.endFill();
    this.hpLabel = game.add.text(0, 0, "Will", Target.fontStyle.label);
    this.hpLabel.setTextBounds(-26, Target.imgSize+4, 24, 12);
    this.hpLabel.fill = Style.text.default.color;
    
    this.dmg = {
        bars: 0, //counter
        last: undefined
    };
    //this.dmgLabel = game.add.text(0, 0, "Damage", Target.fontStyle.header);
    //this.dmgLabel.setTextBounds(Target.imgSize+4, -12, 24, 12);
    //this.dmgLabel.fill = Style.text.default.color
    
    this.space.addChild(this.sprite);
    this.space.addChild(this.hpBar);
    this.space.addChild(this.hpLabel);
    this.space.addChild(this.timeBar);
    this.space.addChild(this.timeLabel);
    //this.space.addChild(this.dmgLabel);
    
    this.update = function(dt) {
        if(this.events.queue.length > 0) this.events.update(dt);
        
        if (!game.grid.gameOver)
        {
            this.time += dt;
            this.timeBar.scale.x = (this.totalTime-this.time)/this.totalTime;
            
            if (this.time >= this.totalTime) 
            {
                game.playData.victory = false;
                this.gameover();
            }
        }
        
    };
    
    this.defeat = function(variant) {
        game.playData.victory = true;
        game.playData.tf = this.transTable[variant];
        this.sprite.frame = game.playData.tf.frame;
        
        this.gameover();
    }
    
    this.damage = function(amount, type) {
        //TODO type weakness/resist
        var mult;
        if (this.typeMult == undefined || this.typeMult[type] == undefined) mult = 1;
        else mult = this.typeMult[type];
        
        this.hp -= mult * amount;
        this.hpBar.clear();
        this.hpBar.beginFill(0x808080);
        this.hpBar.drawRect(0, 0, (this.hp/this.maxHP) * Target.imgSize, 8);
        this.hpBar.endFill();

        if (this.dmg[type] == undefined)
        {
            this.dmg[type] = {
                amount: mult * amount,
                bar: game.add.graphics(0,0),
            };
            
            if (this.dmg.last == undefined)
            {
                this.hpSequence = [ type ];
                this.hpBar.addChild(this.dmg[type].bar);
            }
            else
            {
                this.hpSequence.push(type); 
                this.dmg.last.bar.addChild(this.dmg[type].bar);
            }
            
            this.dmg.last = this.dmg[type];
            this.dmg.bars++;
        }
        else
        {
            this.dmg[type].amount += mult * amount;
        }
        
        this.dmg[type].bar.clear();
        this.dmg[type].bar.beginFill(MatchTypes[type].color);
        this.dmg[type].bar.drawRect(0, 0, Target.imgSize*(this.dmg[type].amount/this.maxHP), 8);
        this.dmg[type].bar.endFill();

        if (this.hp <= 0)
        {
            this.hp = 0;
            var mostDamageType;
            var mostDamage = 0;
            for(var color in this.dmg)
            {
                if (this.dmg[color].amount == undefined) continue;
                
                if (this.dmg[color].amount > mostDamage || mostDamageType == undefined)
                {
                    if (this.transTable[color] != undefined)
                    {
                        mostDamageType = color;
                        mostDamage = this.dmg[color].amount;
                    }
                }
            }
            
            if (mostDamageType == undefined) mostDamageType = this.transTable.default;
            this.defeat(mostDamageType);
        }
        
        //update health bar positions
        if (this.hpSequence != undefined)
        {
            var next = this.dmg[this.hpSequence[0]].bar;
            next.x = (this.hp / this.maxHP) * Target.imgSize;
                
            for (var i = 1; i < this.hpSequence.length; i = i+1)
            {
                next = this.dmg[this.hpSequence[i]].bar;
                var x = this.dmg[this.hpSequence[i-1]].amount/this.maxHP * Target.imgSize;
                next.x = x;
            }
        }
        
        console.log(this.dmg);
    }
    
    this.gameover = function() {
        game.grid.gameOver = true;
        
        var goTimer = game.time.create(true);
        goTimer.add(0.5, goto, this, "gameOver");
        goTimer.start();
    }
}

//Damage Event
function EventDamage(amount, type)
{
    this.time = 1;
    
    this.update = function(dt) {
        game.enemy.damage(amount*dt, type.name);
    };
    
    this.end = function () {
      // game.enemy.damage(amount, type.name);
    };    
}