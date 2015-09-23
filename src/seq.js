'use strict'

var  EvilExtensions = (function () {
    Number.prototype.times = function (block) { for (var i = 0; i < this; i++) { block.call(this, i) } };
    Array.prototype.each  = ([]).__proto__.forEach;
    Array.prototype.remove = function (e) {
        var i = this.indexOf(e);
        if ( i !== -1) {
            this.splice( this.indexOf(e), 1 );
        }

        return this;
    }
    // MDN polyfill
    Array.prototype.includes = function(searchElement /*, fromIndex */) {
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };

})();

function Seq (steps, bpm) {
    var steps = steps || 8,
        bpm = bpm || 300,  
        beat = 60.0 / bpm, // duración del 1 slot en segundos
        round = beat * steps * 1000, // duración de una vuelta en millisegundos
        slots = [],
        context = new AudioContext(),
        clock = new WAAClock(context, {toleranceEarly: 0.1}),
        soundingKeys = [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 90, 88, 67, 86, 66, 78, 77],
        queue = []

    ;
    
    
    function slotAtTime(time){
        return Math.floor(time / beat) % steps;
    }
    
    function schedule(key, time) {
        var slot = slotAtTime(time);
        if ( ! slots[slot].includes(key) ) {
            console.log('adding key ' + key + ' on slot ' + slot);
            slots[slot].push(key);
            
            queue.push({ key: key, slot: slot, time: time })
        }
    }

    function playSlot(slot) {
        slots[slot].each( function (key) {
            console.log('triggering ' + key);
            triggerSound(key);
        });
    }

    function tick() {
        var slot = slotAtTime(context.currentTime);
        playSlot( slotAtTime(context.currentTime) );
    }

    function evict() {       
        var ev = queue.splice(Math.floor(Math.random() * queue.length), 1)[0];
        console.log('evicted sound ' + ev);
        if ( ev !== undefined ) {
            slots[ev.slot].remove(ev.key);
        }
    }
    
    function garbageCollector(){
        console.log('garbage collection! queue size ' + queue.length);
        if (queue.length > 32) { (3).times(evict) }
        else if (queue.length > 16) { (2).times(evict) }
        else if (queue.length > 2) { evict() }
    }

    function launchGarbageCollector(){
        if (queue.length > 16) {
            setInterval(garbageCollector, 4 * round);
        }
    };

    
    // init
    steps.times( function(i) { slots[i] = [] });
    
    window.addEventListener('keydown', function (event) {
        var key = event.keyCode || event.which;
        event.preventDefault();
        if (event.ctrlKey || event.altKey) {
            return false; 
        }
            
        if(soundingKeys.includes(key)) {
            schedule(key, context.currentTime);
        }
    });

    //setInterval(tick, beat * 1000)
    clock.start();
    clock.callbackAtTime(tick, 0)
        .repeat(beat)
        .tolerance({late: 100});

    setInterval(launchGarbageCollector, 2000);
    
    return {
        steps: steps,
        bmp: bpm,
        slots: slots,
        beat: beat,
        context: context,
        clock: clock,
        queue: queue,
    };
}
