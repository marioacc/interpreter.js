/*Tokens type declarations*/
var colors = require("colors");
var Token = require("./token.js");
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

var INTEGER = "INTEGER";
var PLUS = "PLUS";
var EOF = "EOF";


/*The motherfucking interpreter*/
var Interpreter= function (text) {
    //This is the client input, must catch it from args.
    this.text = text;
    //This is a pointer index to text
    this.pos = 0;
    //pointer to the current token being red
    this.current_token = null;
};
//Error handler
Interpreter.prototype.error= function (){
    console.log("Cant parse your shit".error);
};
//Lexical Analyzer
Interpreter.prototype.tokenizer= function (){
    //Is pos at the end of text?
    text = this.text;
    if (this.pos > ( text.lenght -1) ) {
        return new Token(EOF, null);
    }
};
//end of interpreter
var token = new Token(EOF, null);
console.log(token.toString());
var interpreter = new Interpreter("gg");
interpreter.error();
