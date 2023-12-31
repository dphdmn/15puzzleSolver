const scrambleInput = document.getElementById('scrambleInput');
const resultDisplay = document.getElementById('resultDisplay');
const mainContainer = document.getElementById('mainContainer');
const loadingPlaceHolder = document.getElementById('loadingPlaceHolder');
let scramblesFromURLparsed = false;
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
                  if (!scramblesFromURLparsed){
                    testScrambleInURL();
                    scramblesFromURLparsed = true;
                  }
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

function validateScramble(input) {
    // Check if the input contains only numbers, spaces, or '/'
    if (!/^[0-9\s/]*$/.test(input)) {
      return false;
    }
  
    // Split the input string by '/' to get parts
    const parts = input.split('/');
  
    // Check if each part has the same amount of numbers
    const numCounts = parts.map(part => part.split(' ').length);
    const allEqual = numCounts.every(count => count === numCounts[0]);
  
    // Check if the sorted array of all numbers is sequential
    const allNumbers = input.split(/\s|\/| /).map(Number);
    const sortedNumbers = [...allNumbers].sort((a, b) => a - b);
    const isSequential = sortedNumbers.every((num, index) => num === index);
  
    // Return true if both conditions are met, otherwise return false
    return allEqual && isSequential;
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
  let scramble = scrambleInput.value;
  resultDisplay.innerHTML = 'Solving...';
  if (scramble) {
    scramble = scramble.replace(/\s+/g, ' ').trim();
    if (validateScramble(scramble) && scramble.length === 37){
        const solveScramblePromise = solveScramble(scramble);
        const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            resolve("timeout error");
        }, 15000); // 15 seconds timeout
        });

        Promise.race([solveScramblePromise, timeoutPromise])
        .then((result) => {
            if (result === "timeout error") {
            resultDisplay.innerHTML = "Timeout error, please update the page.";
            } else {
            const resultsList = result.split('\n');
            resultDisplay.innerHTML = `${resultsList.length} solutions found<br>${resultsList[0].length} moves optimal length<br>${resultsList.join('<br>')}`;
            }
        });
    } else{
        resultDisplay.innerHTML = 'Bad scramble format.';
    }
  } else {
    resultDisplay.innerHTML = '';
  }
});
function getScrambleParameterFromURL() {
    const scramble = new URLSearchParams(location.search).get("scramble");
    return scramble ? decodeURIComponent(scramble.replace(/_/g, ' ')) : -1;
}
function testScrambleInURL(){
    const testingUrlScramble = getScrambleParameterFromURL();
    if (testingUrlScramble !== -1){
            const solveScramblePromise = solveScramble(testingUrlScramble);
            const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("timeout error");
            }, 15000); // 15 seconds timeout
            });
    
            Promise.race([solveScramblePromise, timeoutPromise])
            .then((result) => {
                if (result === "timeout error") {
                document.body.innerHTML = "-1";
                } else {
                const resultsList = result.split('\n');
                document.body.innerHTML = `${resultsList.join('<br>')}`;
                }
            });
    }
}
window.onmessage = function(event) {
    event.source.postMessage(document.body.innerHTML.split("<br>"), event.origin);
};