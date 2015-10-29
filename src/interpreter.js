
var Token = require("./token.js");
var Exception = require ("./exceptions.js");



var INTEGER = "INTEGER";
var PLUS = "PLUS";
var MINUS = "MINUS";
var MULTIPLICATION = "MULTIPLICATION";
var DIVISION = "DIVISION";
var PARENTOPEN="PARENTOPEN";
var PARENTCLOSE="PARENTCLOSE";
var MODULE = "MODULE";
var POWER = "POWER";
var EOF = "EOF";
var PARENTESHIS = [];
var IF="IF",
    ELSE="ELSE",
    WHILE ="WHILE",
    GT="GT",
    EQUALS="EQUALS",
    LT = "LT",
    DIFFERENT ="DIFFERENT",
    AND = "AND",
    OR ="OR",
    BRACKETOPEN = "BRACKETOPEN",
    BRACKETCLOSE = "BRACKETCLOSE",
    FOR = "FOR",
    COMA = "COMA";


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
Interpreter.prototype.error= function (message){
    throw new Exception(message);
};

//Advances the this.pos pointer and set the this.current_char variable
Interpreter.prototype.advance= function(steps){
    if (steps !== undefined){
        this.pos+=steps;
    }else{
        this.pos += 1;
    }
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
        if (this.current_char === "(") {
            this.advance();
            return new Token(PARENTOPEN,"(");
        }
        if (this.current_char === ")") {
            this.advance();
            return new Token(PARENTCLOSE,")");
        }
        if (this.current_char === "%") {
            this.advance();
            return new Token(MODULE,"%");
        }
        if (this.current_char === "^") {
            this.advance();
            return new Token(POWER,"^");
        }
        if(this.current_char ===">"){
            this.advance();
            return new Token(GT,">");
        }
        if(this.text.substr(this.pos,2) === "=="){
            this.advance(2);
            return new Token(EQUALS,"==");
        }
        if(this.current_char === "<"){
            this.advance();
            return new Token(LT,"<");
        }
        if (this.text.substr(this.pos,2)==="or"){
            this.advance(2);
            return new Token(OR,"or");
        }
        if (this.text.substr(this.pos,3)==="and"){
            this.advance(3);
            return new Token(AND,"and");
        }
        if (this.text.substr(this.pos,2)==="if"){
            this.advance(2);
            return new Token(IF,"if");
        }
        if (this.text.substr(this.pos,4)==="else"){
            this.advance(4);
            return new Token(ELSE,"else");
        }
        if (this.text.substr(this.pos,5)==="while"){
            this.advance(5);
            return new Token(WHILE,"while");
        }
        if (this.current_char==="{"){
            this.advance();
            return new Token(BRACKETOPEN,"{");
        }
        if (this.current_char==="}"){
            this.advance();
            return new Token(BRACKETCLOSE,"}");
        }

        this.error("Error Tokenizing the function");
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
        this.error("Error eating the token at method 'eat'. this.current_token.type ="+this.current_token.type+" and "+"tokenType ="+tokenType);
    }

};
//Return an integer value
Interpreter.prototype.term = function () {
    // body...
    var result;
    if (this.current_token.type === PARENTOPEN){
        return this.parenthesis();
    }else if (this.current_token.type === INTEGER){
        result = this.factor();
    }

    while ( [MULTIPLICATION,DIVISION,MODULE].indexOf(this.current_token.type) !== -1){
        var token = this.current_token;
        if (token.type === MULTIPLICATION){
            this.eat(MULTIPLICATION);
            if (this.current_token.type === PARENTOPEN){
                result *= this.parenthesis();
            }else{
                result*=this.factor();
            }

        }else if (token.type === DIVISION) {
            this.eat(DIVISION);
            if (this.current_token.type === PARENTOPEN){
                result /= this.parenthesis();
            }else{
                result/=this.factor();
            }
        }else if (token.type === MODULE) {
            this.eat(MODULE);
            if (this.current_token.type === PARENTOPEN){
                result %= this.parenthesis();
            }else{
                result %=this.factor();
            }
        }else if (token.type === POWER){
            return this.superterm();
            }

        }

    return result;
};
//Return an interger value
Interpreter.prototype.superterm = function () {
    var result;
    if (this.current_token.type === PARENTOPEN){
        return this.parenthesis();
    }else if (this.current_token.type === INTEGER){
        result = this.term();
    }
    while ( [POWER].indexOf(this.current_token.type) !== -1){
        var token = this.current_token;
        if (token.type === POWER){
            this.eat(POWER);
            if (this.current_token.type === PARENTOPEN){
                result = Math.pow(result,this.parenthesis());
            }else{
                result =Math.pow(result,this.factor());
            }
        }
    }
    return result;
};
//Factor = integer
Interpreter.prototype.factor = function () {
    var token = this.current_token;
    this.eat(INTEGER);
    return token.value;
};
Interpreter.prototype.parenthesis = function(){
        PARENTESHIS.push(this.current_token);
        this.eat(PARENTOPEN);
        return this.oper();
};
//Expression Analyzer
Interpreter.prototype.oper = function () {
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    //we expect the current token to be a single-digit integer
    var result;
    if (this.current_token.type === PARENTOPEN){
        result = this.parenthesis();
    }else if (this.current_token.type === INTEGER){
        result = this.superterm();
    }
    var token = this.current_token;
    while ([PLUS,MINUS,PARENTCLOSE].indexOf(this.current_token.type) !== -1 ){

        if (token.type === PARENTCLOSE){
            this.eat(PARENTCLOSE);
            PARENTESHIS.pop();
        }
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
        }else if (token.type === MODULE) {
            this.eat(MODULE);
            result = result%(Number(this.term()));
        }else if (token.type === POWER) {
            this.eat(POWER);
            result = Math.pow(result,Number(this.superterm()));
        }

    }
    while ([LT,GT,EQUALS,AND,OR].indexOf(this.current_token.type) !== -1 ) {
        token = this.current_token;
        if (token.type === PARENTCLOSE){
            this.eat(PARENTCLOSE);
            PARENTESHIS.pop();
        }
        if (token.type === LT) {
            this.eat(LT);
            return result < this.oper();
        }else if (token.type === GT) {
            this.eat(GT);
            return result > this.oper();
        }else if (token.type === EQUALS) {
            this.eat(EQUALS);
            return result == this.oper();
        }else if (token.type === OR) {
            this.eat(OR);
            return result || this.oper();
        }else if (token.type === AND) {
            this.eat(AND);
            return result && this.oper();
        }
    }
    return result;
};
Interpreter.prototype.constm = function(){
    this.eat(IF);
    if (this.current_token.type===PARENTOPEN){
        if (this.parenthesis()){
            if (PARENTESHIS.length !== 0){
                this.error("The if statement has no ')'");

            }else{
                this.eat("BRACKETOPEN");
                while (this.current_token.type !== BRACKETCLOSE){
                    console.log(this.oper());
                    console.log(this.current_char);
                }
                this.eat("BRACKETCLOSE");

            }
            if (this.current_token.type === ELSE) {
                this.eat(ELSE);
                this.eat("BRACKETOPEN");
                while (this.current_token.type !== EOF || this.current_token.type !== BRACKETCLOSE){
                    console.log(this.oper());
                }
                this.eat("BRACKETCLOSE");
            }
        }
    }
    else {
        this.error("The if statements have not '( '");
    }
};
Interpreter.prototype.while = function (first_argument) {
    // body...
    this.eat(WHILE);
    if (this.current_token.type===PARENTOPEN){
        var statementPosition = this.pos;
        while (this.parenthesis()){
            if (PARENTESHIS.length !== 0){
                this.error("The if statement has no ')'");
            }else{
                this.eat("BRACKETOPEN");

                while (this.current_token.type !== BRACKETCLOSE){
                    console.log(this.oper());
                    console.log(this.current_char);
                }
                this.pos= statementPosition;
                this.eat("BRACKETCLOSE");
            }
        }
    }
    else {
        this.error("The if statements have not '( '");
    }
};
interpreter.prototype.for = function (){
    this.eat(FOR);
    if (this.current_token.type===PARENTOPEN){
        var statementPosition = this.pos;
        while (this.parenthesis()){
            if (PARENTESHIS.length !== 0){
                this.error("The if statement has no ')'");
            }else{
                this.eat("BRACKETOPEN");

                while (this.current_token.type !== BRACKETCLOSE){
                    console.log(this.oper());
                    console.log(this.current_char);
                }
                this.pos= statementPosition;
                this.eat("BRACKETCLOSE");
            }
        }
    }
    else {
        this.error("The if statements have not '( '");
    }
}
Interpreter.prototype.expr = function (){
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    this.current_token = this.tokenizer();

    if (this.current_token.type === PARENTOPEN || this.current_token.type === INTEGER){
        return this.oper();
    } else if (this.current_token.type === IF) {
        this.constm();
    }else if (this.current_token.type === WHILE){
        return this.while();
    }
};

module.exports =Interpreter;
