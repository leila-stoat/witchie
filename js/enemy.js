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
    
    this.space.addChild(this.sprite);
    this.space.addChild(this.hpBar);
    this.space.addChild(this.timeBar);
    
    this.update = function(dt) {
        this.time += dt;
        if (this.time >= this.totalTime) 
        {
            alert("Game Over!");
            this.update = function() {};
        }
        this.timeBar.scale.x = this.time/this.totalTime;
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
        
        if (this.hp <= 0)
        {
            this.hp = 0;
            this.defeat(type);
        }
    }
}