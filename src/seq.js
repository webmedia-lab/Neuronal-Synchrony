'use strict'

var  EvilExtensions = (function () {
    (1).__proto__.times = function (block) { for (var i = 0; i < this; i++) { block.call(this, i) } };
    ([]).__proto__.each  = ([]).__proto__.forEach;
})()


function Seq (steps, bpm) {
    var steps = steps || 8,
        bpm = bpm || 400,  
        beat = 60 / bpm, // duracion del 1 slot
        slots = [],
        current = 0,
        context = new AudioContext() ;

    steps.times( function(i) { slots[i] = [] });
    
    
    function play() {
        var now = context.currentTime// (Date.now() * 1000 + new Date().getMilliseconds()) / 1000; 
        current = Math.floor((now / beat) % steps)
        console.log(current);
        slots[current].forEach( function (key) {
            triggerSound(key);
        });
    }
    

    window.addEventListener('keyup', function (event) {
        console.log(event);
        slots[current].push( event.keyCode || event.which );
    });

    setInterval(play, beat)
    
    return {
        steps: steps,
        bmp: bpm,
        slots: slots,
        beat: beat,
        current: current,
    };
}
