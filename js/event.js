//Event Stack/Queue
//used for render effects and other triggers
//The Stack is composed of queues, processed as they are available
//The queues are processed entirely, all events in the same cycle
function EventQueue()
{
    this.queue = [];
    //Update Stack
    //Process all events at the start of the queue
    this.update = function(dt)
    {
        var first = this.queue.shift();
        if (first == undefined) return;
        
        first.set.push(new EventEndQueue());
        
        var event;
        do
        {
            event = first.set.shift();
            if (event.endQueue) continue;
            
            if (event.time > dt)
                event.update(dt);
            else
                event.update(event.time);
            
            event.time = event.time - dt;
            if (event.time <= 0)
                event.end();
            else
                first.set.push(event);
            
        } while(!event.endQueue);
        
        if (first.set.length > 0) //Push back if not done yet
            this.queue.unshift(first);
    }
    
    //Add a queue of events to the stack
    this.add = function (Q)
    {
        //default time is 0(for immediate event)
        if (Q.constructor === Array)
            this.queue.push({set: Q, parent: this});
        else
            this.queue.push({set: [Q], parent: this});
    };
    
    //Discard next queued event set
    this.discard = function()
    {
        this.queue.shift();
    }
}

//Event types
//Just wait
function EventDelay(time)
{
    this.time = time;
    
    this.update = function(dt) {};
    this.end = function() {};
}

//End of Event Queue marker
function EventEndQueue()
{
    this.time = 0;
    
    this.endQueue = true;
    
    this.update = function(dt) {};
    this.end = function() {};
}