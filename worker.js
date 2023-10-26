var ready = false;
var Module = {
    "onRuntimeInitialized": function(){
        var initialize = Module.cwrap("init", "void");
        postMessage({message: "initializing"});
        initialize();
        ready = true;
        postMessage({message: "ready"});
    }
};
importScripts("solver3.js");
this.addEventListener("message",
    function(d){
        if(!ready){
            return;
        }
        ready = false;
        var msg = d.data;
        if(msg["message"] == "solve"){
            var solve = Module.cwrap("solveScramble", "string", ["string"]);
            var scrambles = msg["scrambles"];
            var n = scrambles.length;
            for(var i=0; i<n; i++){
                var scramble = scrambles[i];
                var solution = solve(scramble);
                postMessage({message: "solve", scramble: scramble, solution: solution});
            }
        }
        ready = true;
        postMessage({message: "ready", previous: msg});
    },
false);
