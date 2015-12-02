//The target that'll be hit
//Args:
// - hp: Hit Points, of course
// - sprite: spritesheet identifier of the target(check doc)
// - time: total time to defeat the target
// - transform: transformation table(for defeat)
// - damage: type match table(damage multipliers)
function Target(data)
{
    Target.imgSize = 80;
    
    this.space = game.add.graphics(game.world.width/2 - Target.imgSize/2, 16);
    this.sprite = game.add.sprite(0, 0, data.sprite);
    this.sprite.scale.x = Target.imgSize/this.sprite.width;
    this.sprite.scale.y = Target.imgSize/this.sprite.height;
    this.sprite.frame = 0;
    
    this.transTable = data.transform;
    this.typeMult = data.damage;
    
    this.events = new EventQueue();
    
    this.totalTime = data.time;
    this.time = 0;
    this.timeBar = game.add.graphics(0, -12);
    this.timeBar.beginFill(0x00c0ff);
    this.timeBar.drawRect(0, 0, Target.imgSize, 8);
    this.timeBar.endFill();
    
    this.hp = data.hp;
    this.maxHP = data.hp;
    this.hpBar = game.add.graphics(0, Target.imgSize+4);
    this.hpBar.beginFill(0xff0000);
    this.hpBar.drawRect(0, 0, Target.imgSize, 8);
    this.hpBar.endFill();
    
    this.dmg = {
        bars: 0 //counter
    };
    
    this.space.addChild(this.sprite);
    this.space.addChild(this.hpBar);
    this.space.addChild(this.timeBar);
    
    this.update = function(dt) {
        if(this.events.queue.length > 0) this.events.update(dt);
        
        if (!game.grid.gameOver)
        {
            this.time += dt;
            this.timeBar.scale.x = (this.totalTime-this.time)/this.totalTime;
            
            if (this.time >= this.totalTime) 
            {
                alert("Game Over!");
                game.grid.gameOver = true;
            }
        }
        
    };
    
    this.defeat = function(variant) {
        var changeFrame;
        if (this.transTable == undefined || this.transTable[variant] == undefined) changeFrame = 1;
        else changeFrame = this.transTable[variant];
        
        this.sprite.frame = changeFrame;
    }
    
    this.damage = function(amount, type) {
        //TODO type weakness/resist
        var mult;
        if (this.typeMult == undefined || this.typeMult[type] == undefined) mult = 1;
        else mult = this.typeMult[type];
        
        this.hp -= mult * amount;
        this.hpBar.scale.x = this.hp/this.maxHP;
        
        if (this.dmg[type] == undefined)
        {
            this.dmg[type] = {
                amount: mult * amount,
                bar: game.add.graphics(Target.imgSize, 1 + this.dmg.bars * 10)
            };
            
            this.dmg[type].bar.beginFill(MatchTypes[type].color);
            this.dmg[type].bar.drawRect(0, 0, Target.imgSize, 8);
            this.dmg[type].bar.endFill();
            this.space.addChild(this.dmg[type].bar);
            
            this.dmg[type].bar.scale.x = -(mult * amount)/this.maxHP;
            this.dmg.bars++;
        }
        else
        {
            this.dmg[type].amount += mult * amount;
            this.dmg[type].bar.scale.x += (mult * amount)/this.maxHP;
        }
        
        if (this.hp <= 0)
        {
            game.grid.gameOver = true;
            
            this.hp = 0;
            var mostDamageType;
            var mostDamage = 0;
            for(var color in this.dmg)
            {
                if (this.dmg[color].amount == undefined) continue;
                
                if (this.dmg[color].amount > mostDamage || mostDamageType == undefined)
                {
                    mostDamageType = color;
                    mostDamage = this.dmg[color].amount;
                }
            }
            this.defeat(mostDamageType);
        }
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