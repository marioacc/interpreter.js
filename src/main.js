var Interpreter = require("./interpreter.js");
var readline = require("readline");
var colors = require("colors");
var fs = require("fs");

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
//Initializes the readline object, this object read the input users and
//creates an standart prompt, just to be cool guys.

var rl= readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt("Interpreter.js>");
var content= fs.readFileSync("./src/test/test.txt","utf8");
var interpreter = new Interpreter(content);
interpreter.expr();


// rl.prompt();
//
// rl.on("line", function (line){
//     var interpreter = new Interpreter(line);
//     var result = interpreter.expr();
//     console.log(result);
//     rl.prompt();
// });
