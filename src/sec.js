'use strict'

function EvilExtensions () {
    (1) .__proto__.times = function (block) { for (var i = 0; i < this; i++) { block.call(this, i) } };
    ([]).__proto__.each  = ([]).__proto__.forEach;
    
}();

Seq = function(beats, bpm) {
    var self = {},
        beats = beats || 15,
        bpm = bpm || 400,  
        slots = [],
        current = 0,
        beatDuration = 60/bpm,               // duracion del 1 slot
        barDuration = beatDuration * beats,  // duración de una vuelta
        
        context = new AudioContext(),
        clock = new WAAClock(context, {toleranceEarly: 0.1})
    ;

    function triggerKeypress(key){
        dispatchEvent(new KeyboardEvent('keydown', { code: key }));
    }
    
    function heartBeat(i) {
        var beat = function  () {
            current = i;
            slots[i].each(key){ triggerKeyPress(key) };
        };
        
        var event = clock.callbackAtTime( beat, nextBeatTime(i) );
        event.repeat(barDuration);
        event.tolerance({ late: 0.01 });
    }
    
    
    function nextBeatTime(i) {
        var currentTime = context.currentTime,
            currentBar = Math.floor(currentTime / barDuration),
            currentBeat = Math.round(currentTime % barDuration)
        ;
        
        if (currentBeat < i) {
            return currentBar * barDuration + i * beatDuration;
        } else {
            return (currentBar + 1) * barDuration + i * beatDuration;
        }
    }

    self.addKey = function(key, slot) {
        slots[current].push(key);
    }
    
    // init()
    size.times( function(i) { slots[i] = [] });
    
    window.addEventListener('keydown', function (event) {
        self.addKey( event.keyCode || event.which )
    });
    //arrancar el reloj y el callback que dispara las letras de cada slot
    heartbeat(0);
    clock.start();
}
