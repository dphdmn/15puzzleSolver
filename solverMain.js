const scrambleInput = document.getElementById('scrambleInput');
const resultDisplay = document.getElementById('resultDisplay');
const mainContainer = document.getElementById('mainContainer');
const loadingPlaceHolder = document.getElementById('loadingPlaceHolder');
class Solver{
  constructor(){
      this.worker = new Worker("worker.js");
      this.ready = false;
      var that = this;
      this.worker.addEventListener("message",
          function(d){
              var msg = d.data;
              if(msg["message"] == "ready"){
                  that.ready = true;
                  mainContainer.style.display = "contents";
                  loadingPlaceHolder.style.display = "none";
                  var previous = msg["previous"];
                  if(previous != undefined){
                      if(previous["message"] == "solve"){
                          that.resolve(that.solveScramble);
                      }
                  }
              }
              else if(msg["message"] == "solve"){
                  that.solveScramble = msg["solution"];
              }
          },
      false);
  }
  solve(scramble){
      if(!this.ready){
          return;
      }
      this.ready = false;
      var that = this;
      this.promise = new Promise(function(resolve, reject){
          that.resolve = resolve;
          that.reject = reject;
      });
      this.worker.postMessage({message: "solve", scrambles: [scramble]});
      return this.promise;
  }
}
var solver = new Solver();
async function solveScramble(scramble){
  if(!solver.ready) return [];
  var result = await solver.solve(scramble);
  return result;
}
scrambleInput.addEventListener('input', () => {
    resultDisplay.innerHTML = '';
});
scrambleInput.addEventListener('change', () => {
  const scramble = scrambleInput.value;
  resultDisplay.innerHTML = 'Solving...';
  if (scramble) {
    solveScramble(scramble).then((result) => {
        const resultsList = result.split('\n');

        resultDisplay.innerHTML = `${resultsList.length} solutions found<br>${resultsList[0].length} moves optimal length<br>${resultsList.join('<br>')}`;  
    });
  } else {
    resultDisplay.innerHTML = '';
  }
});