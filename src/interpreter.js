
var Token = require("./token.js");
var Exception = require ("./exceptions.js");



var INTEGER = "INTEGER";
var PLUS = "PLUS";
var EOF = "EOF";

/*The motherfucking interpreter*/
var Interpreter = function (text) {
    "use strict";
    //This is the client input, must catch it from args.
    this.text = text;

    //This is a pointer index to text
    this.pos = 0;
    //pointer to the current token being red
    this.current_token = null;
};
//Error handler
Interpreter.prototype.error= function (){
    throw new Exception("Error parsing the statement");
};
//Lexical Analyzer
Interpreter.prototype.tokenizer= function (){
    "use strict";
    //Is pos at the end of text?
    var text = this.text;
    if (this.pos > ( text.length-1)  ) {
        return new Token(EOF, undefined);
    }

    //get character at position this.pos and decide whta token create
    //based on the single character
    var current_char = text[this.pos];

     //if the character is a digit then convert it to
     //integer, create an INTEGER token, increment this.pos
     //index to point to the next character after the digit,
     //and return the INTEGER token
     if (!isNaN(current_char)) {

        token = new Token(INTEGER, Number(current_char));
        this.pos += 1;
        return token;
     }

     if (current_char == "+"){
         var token = new Token(PLUS, current_char);
         this.pos += 1;
         return token;
     }

     this.error();

};
//Token Verifier
Interpreter.prototype.eat = function (tokenType){
    //compare the current token type with the passed token
    //type and if they match then "eat" the current token
    //and assign the next token to the this.current_token,
    //otherwise raise an exception.
    "use strict";

    if (this.current_token.type == tokenType){
        this.current_token = this.tokenizer();
    }else {
        this.error();
    }

}
//Expression Analyzer
Interpreter.prototype.expr = function (){
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    this.current_token = this.tokenizer();

    //we expect the current token to be a single-digit integer
    var left = this.current_token;
    this.eat(INTEGER)

    //we expect the current token to be a '+' token
    var op = this.current_token;
    this.eat(PLUS)

    //we expect the current token to be a single-digit integer
    var right = this.current_token;
    this.eat(INTEGER)
    //after the above call the this.current_token is set to
    //EOF token

    //at this point INTEGER PLUS INTEGER sequence of tokens
    //has been successfully found and the method can just
    //return the result of adding two integers, thus
    //effectively interpreting client input

    var result = left.value + right.value;
    return result;
}

module.exports =Interpreter;
