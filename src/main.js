/*Tokens type declarations*/
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

var INTEGER = "INTEGER";
var PLUS = "PLUS";
var EOF = "EOF";

/*Token class*/
function Token(type, value) {
    //initializes the token with a type and a value
           self.type = type;
           self.value = value;
    //turns the token to a string format "Token(type,value)"
        function str(){
            return "Token(" + this.type + "," + this.value + ")";
        }
    }
/*The motherfucking interpreter*/
function Interpreter(text) {
    //This is the client input, must catch it from args.
    self.text = text;
    //This is a pointer index to text
    self.pos = 0;
    //pointer to the current token being red
    self.current_token;
    //Error handler
    function error (){
        console.log("Cant parse your shit".error);
    }
    //Lexical Analyzer
    function Tokenizer(){
        //Is pos at the end of text?
        if (self.pos > (text.lenght-1)) {
            return Token(EOF, none);
        }
    }
}//end of interpreter
