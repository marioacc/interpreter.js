
var Token = require("./token.js");
var Exception = require ("./exceptions.js");



var INTEGER = "INTEGER";
var PLUS = "PLUS";
var MINUS = "MINUS";
var MULTIPLICATION = "MULTIPLICATION";
var DIVISION = "DIVISION";
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
    this.current_char = this.text[this.pos];
};
//Error handler
Interpreter.prototype.error= function (){
    throw new Exception("Error parsing the statement");
};

//Advances the this.pos pointer and set the this.current_char variable
Interpreter.prototype.advance= function(){
    this.pos += 1;
    if (this.pos > this.text.length - 1) {
        this.current_char = undefined;
    } else {
        this.current_char = this.text[this.pos];
    }
};

//To skips whitespaces
Interpreter.prototype.skipWhitespace = function(){
    while (this.current_char !== undefined && this.current_char === " "){
        this.advance();
    }
};
//Return an integer of n terms
Interpreter.prototype.integer = function(){
    var result = "";
    while (this.current_char !== undefined && !isNaN(this.current_char)){
        result += this.current_char;
        this.advance();
    }
    return Number(result);
};
//Lexical Analyzer
Interpreter.prototype.tokenizer= function (){
    "use strict";
    //A while method to get all the elements in the statement and make the tokens

    while (this.current_char !== undefined) {

        if (this.current_char === " "){
            this.skipWhitespace();
            continue;
        }

        if (!isNaN(this.current_char)) {
            return new Token(INTEGER, this.integer());
        }

        if (this.current_char === "+") {
            this.advance();
            return new Token(PLUS,"+");
        }

        if (this.current_char === "-") {
            this.advance();
            return new Token(MINUS,"-");
        }

        if (this.current_char === "*") {
            this.advance();
            return new Token(MULTIPLICATION,"*");
        }

        if (this.current_char === "/") {
            this.advance();
            return new Token(DIVISION,"/");
        }
        this.error();
    }
    return new Token(EOF, undefined);

};
//Token Verifier
Interpreter.prototype.eat = function (tokenType){
    //compare the current token type with the passed token
    //type and if they match then "eat" the current token
    //and assign the next token to the this.current_token,
    //otherwise raise an exception.
    "use strict";

    if (this.current_token.type === tokenType){
        this.current_token = this.tokenizer();
    }else {
        this.error();
    }

};
//Return an integer value
Interpreter.prototype.term = function () {
    // body...
    var token = this.current_token;
    this.eat(INTEGER);
    return token.value;

};
//Expression Analyzer
Interpreter.prototype.expr = function (){
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    this.current_token = this.tokenizer();

    //we expect the current token to be a single-digit integer
    var result = this.term();
    while ([PLUS,MINUS, DIVISION, MULTIPLICATION].indexOf(this.current_token.type) !== -1 ){
        var token = this.current_token;
        if (token.type === PLUS) {
            this.eat(PLUS);
            result += Number(this.term());
        }else if (token.type === MINUS) {
            this.eat(MINUS);
            result -= Number(this.term());
        }else if (token.type === MULTIPLICATION) {
            this.eat(MULTIPLICATION);
            result *= Number(this.term());
        }else if (token.type === DIVISION) {
            this.eat(DIVISION);
            result /= Number(this.term());
        }
    }
    return result;
};

module.exports =Interpreter;
