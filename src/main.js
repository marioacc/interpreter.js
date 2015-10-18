var Interpreter = require("./interpreter.js");
var readline = require("readline");
var colors = require("colors");
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
    output: process.stdout,
    terminal: true
});
rl.setPrompt("Interpreter.js>");
rl.prompt();
rl.on("line" , function (cmd){
    var interpreter = new Interpreter(cmd.trim());
    var result = interpreter.expr();
    console.log(colors.info(result));
    rl.prompt();
});
