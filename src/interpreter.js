
var Token = require("./token.js");
var Exception = require ("./exceptions.js");
var variable = require ("./variable.js");
var function_var = require ("./function.js");

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
var VARASS = "VARASS";
var VARDEF = "VARDEF";
var VAR = "VAR";
var END_STATEMENT= "END_STATEMENT";
var FUNCDEF = "FUNCDEF";
var FUNCCALL = "FUNCCALL";
var RETURN = "RETURN";
var PARENTESHIS = []; //parenteSHIS? jajaja
//variables and super awsome stack
var varstack= new Array(); 
//CONSTANTES
var e = new variable('e', 2.73);
var p = new variable('p', 3.141592);
varstack.push(e);
varstack.push(p);
/*******************/
var funcstack = new Array();
var process_stack = [[]];
//RESERVED DICTTIONARIES
var var_reserved = ["=", "var"];
var cs_reserved = ["if", "else", "while", "for"];
var RESERVED = [var_reserved,cs_reserved];
//VARIABLES FOR funccalls
var pos_on_funccall;
var current_char_on_funccall;
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
    while (this.current_char !== undefined && /\s/.test(this.current_char)){
        this.advance();
    }
};
//Return an integer of n terms
Interpreter.prototype.integer = function(){
    var result = "";
    while (/^\d+$/.test(this.current_char)){
        result += this.current_char;
        this.advance();
    }
    return Number(result);
};
//Read variable definitions
Interpreter.prototype.vardef = function() {
   var variable_name = "";
   while (this.current_char !== undefined && isNaN(this.current_char) || this.current_char===" ")
   {
      if(this.current_char === " "){this.skipWhitespace(); continue;}
      if(this.current_char === "=" && this.current_char!== ""){
         if(RESERVED.indexOf(variable_name) === -1){
            var this_new_var = new variable(variable_name, undefined);
            varstack.push(this_new_var);
            this.advance();
            this.varass(this_new_var.name);
            return this_new_var.name;
            //console.log("New variable: " + this_new_var.name+ "created successfully");
         }else {this.error("You used a reserved word, dont be that guy plz: Line 76");}
      }
      variable_name += this.current_char;
      this.advance();
      if(this.current_char === ";"){
         this.advance();
         break;
      }

   }
   if(RESERVED.indexOf(variable_name) === -1){
      var this_new_var = new variable(variable_name, undefined);
      varstack.push(this_new_var);
      this.eat(VARDEF);

      //console.log("New variable: " + this_new_var.name+ "created successfully");
  }
};
//Read variable assigination
Interpreter.prototype.varass = function (varname) {
   var variable_name;
   if(varname === undefined)
      while (this.current_char !== undefined && isNaN(this.current_char) || this.current_char===" "){
         if(this.current_char === " "){this.skipWhitespace();continue;}
         if(this.current_char === "=" && varname !== ""){
              for (var i = 0, len = varstack.length; i < len; i++) {
                  if(varstack[i].name === variable_name){
                     this.advance();
                     this.eat(VARASS);
                     varstack[i].value = this.oper();
                     return;
                  }
               }
         }
         variable_name = this.current_char;
         this.advance();
      }
   this.eat(VARDEF);
   var variable_value = this.oper();
   for (var i = 0, len = varstack.length; i < len; i++) {
      if(varstack[i].name === varname){
         varstack[i].value =variable_value;
      }
   }/*for Chrome testing you can use:
   varstack.prototype.forEach(function (element, index, array) {
      if(element === varname){
         varstack[index].value = variable_value;
      }
   });*/
};
//Read var value
Interpreter.prototype.getVarValue = function() {
   variable_name = this.current_char;
   for (var i = 0, len = varstack.length; i < len; i++) {
      if(varstack[i].name === variable_name){
         return varstack[i].value;
      }
   }

} ;

   /*For chrome testing you can use:
   varstack.prototype.forEach(function(element, index, array){
      if(element === variable_name){
         return varstack[index].value;
      }
   });*/
   //this.eat(VAR);

//Look for already declared variable and return tru if exists of varstack
Interpreter.prototype.isOnVarstack = function (varname) {
   for (var i = 0, len = varstack.length; i < len; i++) {
      if(varstack[i].name === varname){
         return true;
      }
   }
   return false;
};
//Look for already declared functions on the funcstack and return if exists,
Interpreter.prototype.isOnFuncstack = function (funcname) {
   for (var i = 0, len = funcstack.length; i < len; i++) {
      if(funcstack[i].name.indexOf(funcname)){
         return true;
      }
   }
   return false;
};
/*Function definitions*/
Interpreter.prototype.funcdef= function(){
   //console.log("funcdef entered");
   var func_name = "";
   while(this.current_char !== "{" && this.current_char !== undefined){
      if(this.current_char === " "){ this.skipWhitespace(); continue;} 
      func_name += this.current_char;
      this.advance();
      //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
   }
   this.advance();
   //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
   func_name.trim();
   //console.log(func_name);
   //name, beggining, cur_char,cur_token,text
   var new_func =new function_var(func_name, this.pos, this.text, this.findEnd());
   //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
   //console.log (new_func.toString());
   funcstack.push(new_func);
   this.eat(FUNCDEF);
}
/*Function call handler*/
Interpreter.prototype.funccall = function() {
   var funcname= "";
   while (this.current_char !== "(" && this.current_char !== undefined){
      if(this.current_char === " "){this.skipWhitespace();continue;}
      funcname += this.current_char;
      this.advance();
   };
   while(this.current_char !== ";" && this.current_char !== undefined){
      if(this.current_char === " ") {this.skipWhitespace();continue;} 
      this.advance();
   }
   pos_on_funccall = this.pos;
   current_char_on_funccall = this.current_char;
   var func_called;
    for (var i = 0, len = funcstack.length; i < len; i++) {
      if(funcstack[i].name === funcname){
         func_called = funcstack[i];
      }
   }
   process_stack.push([func_called,pos_on_funccall]);
   this.pos = func_called.beggining;
   this.current_char = this.text[this.pos];
   this.eat(FUNCCALL);
};
/*Function end handler*/
Interpreter.prototype.return = function (){
   this.advance();
   var pos = process_stack.pop()
   this.pos = pos[1];
   this.current_char = this.text[this.pos];
   this.eat (RETURN);
};
Interpreter.prototype.findEnd = function() {
   //console.log("find end entered");
   //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
   while(this.text.substr(this.pos,6)!=="return" || this.current_char === " "){
      //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
      //var substring = this.text.substr(this.pos,6);
      //console.log(substring);
      this.advance();
   }
   this.advance(8);
   //console.log("find end finished");
   //console.log("POSITION: " + this.pos + "CHAR AT POS: " +this.current_char);
   return this.pos;
};
//Lexical Analyzer
Interpreter.prototype.tokenizer= function (){
    "use strict";
    //A while method to get all the elements in the statement and make the tokens

    while (this.current_char !== undefined) {

         var regex_varass = /[a-z]\S*=/;
         var isRegex = regex_varass.test(this.text.substr(this.pos,3));
         var regex_funccall = /[A-Za-z]+\(\);/;
         var isRegexFunc = regex_funccall.test(this.text.substr(this.pos,15));
         var substring_func = (this.text.substr(this.pos,15));
       //console.log(substring_func);
       if(this.current_char === ";"){
           this.advance();
           return new Token(END_STATEMENT, ";");
         }

        if (/\s/.test(this.current_char)){
            this.skipWhitespace();
            continue;
        }

        if ( /^\d+$/.test(this.current_char)) {
            var integer = Number(this.current_char);
            this.advance();
            return new Token(INTEGER, integer);
        }

        if (this.current_char===","){
            this.advance();
            return Token (COMA,",");
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
        if (this.text.substr(this.pos,3)==="var"){
            this.advance(3);
            return new Token(VARDEF, "vardef");
        }
       if(isRegex){
            return new Token (VARASS, "varass");
       }
        if (this.isOnVarstack(this.current_char) && !isRegex){
            return new Token(VAR, this.getVarValue());
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
    
        if (this.text.substr(this.pos,4)==="func"){
            this.advance(4);
            return new Token(FUNCDEF,"funcdef");
        }
       if (isRegexFunc && this.isOnFuncstack(this.text.substr(this.pos,15))){
            return new Token(FUNCCALL,"funccall");
        }
       if (this.text.substr(this.pos,6)=== "return"){
         return new Token(RETURN);
       }
        this.error("Error Tokenizing the function. The this.current_char is "+this.current_char);
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
    }else if (this.current_token.type === INTEGER || this.current_token.type === VAR){
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
    }else if (this.current_token.type === INTEGER || this.current_token.type === VAR){
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
//Factor = integer or var
Interpreter.prototype.factor = function () {
    var token = this.current_token;
   if(this.current_token.type === INTEGER){
       this.eat(INTEGER);
       return token.value;
   }else if(this.current_token.type === VAR){
      var token_var = token.value;
      this.advance();
      this.eat(VAR);
      return token_var;
   }

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
    }else if (this.current_token.type === INTEGER || this.current_token.type === VAR){
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
        var statement=this.parenthesis();
        if (statement){

            if (PARENTESHIS.length !== 0){
                this.error("The if statement has no ')'");

            }else{

                this.eat(BRACKETOPEN);
                while (this.current_token.type !== BRACKETCLOSE){
                    if (this.current_token.type === VARASS){
                        this.varass();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === VARDEF) {
                        this.vardef();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === INTEGER || this.current_token.type=== PARENTOPEN) {
                        console.log(this.oper());
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === WHILE){
                        this.while();
                    }else if (this.current_token.type ===IF) {
                        this.constm();
                    }

                }
                this.eat(BRACKETCLOSE);

            }
            if (!statement && this.current_token.type === ELSE) {
                this.eat(ELSE);
                this.eat(BRACKETOPEN);
                while (this.current_token.type !== BRACKETCLOSE){
                    if (this.current_token.type === VARASS){
                        this.varass();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === VARDEF) {
                        this.vardef();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === INTEGER || this.current_token.type=== PARENTOPEN) {
                        console.log(this.oper());
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === WHILE){
                        this.while();
                    }else if (this.current_token.type ===IF) {
                        this.constm();
                    }
                }
                this.eat(BRACKETCLOSE);
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
        var statementToken= this.current_token;
        var statementChar = this.current_char;
        while (this.parenthesis()){
            if (PARENTESHIS.length !== 0){
                this.error("The while statement has no ')'");
            }else{
                this.eat(BRACKETOPEN);
                while (this.current_token.type !== BRACKETCLOSE){
                    if (this.current_token.type === VARASS){
                        this.varass();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === VARDEF) {
                        this.vardef();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === INTEGER || this.current_token.type=== PARENTOPEN) {
                        console.log(this.oper());
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === WHILE){
                        this.while();
                    }else if (this.current_token.type ===IF) {
                        this.constm();
                    }
                }
                this.eat("BRACKETCLOSE");
                this.pos= statementPosition;
                this.current_token= statementToken;
                this.current_char= statementChar;
            }
        }
    }
    else {
        this.error("The while statements have not '( '");
    }
};
Interpreter.prototype.for = function (){
    //console.log("asdasdasd"+this.current_token.type);
    this.eat(FOR);
    if (this.current_token.type===PARENTOPEN){
        var statementPosition = this.pos;
        var statementToken= this.current_token;
        var statementChar = this.current_char;
        this.eat(PARENTOPEN);
        while (this.oper()){
            this.eat(COMA);
            this.oper();
            this.eat(PARENTCLOSE);
            if (PARENTESHIS.length !== 0){
                this.error("The for statement has no ')'");
            }else{
                this.eat(BRACKETOPEN);
                while (this.current_token.type !== BRACKETCLOSE){
                    if (this.current_token.type === VARASS){
                        this.varass();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === VARDEF) {
                        this.vardef();
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === INTEGER || this.current_token.type=== PARENTOPEN) {
                        console.log(this.oper());
                        this.eat(END_STATEMENT);
                    }else if (this.current_token.type === WHILE){
                        this.while();
                    }else if (this.current_token.type ===IF) {
                        this.constm();
                    }
                }
                this.eat(BRACKETCLOSE);
                this.pos= statementPosition;
                this.current_token= statementToken;
                this.current_char= statementChar;
            }
        }
    }
    else {
        this.error("The while statements have not '( '");
    }
};

Interpreter.prototype.expr = function (){
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    this.current_token = this.tokenizer();
    while (this.current_token.type !== EOF) {
        console.log(this.current_token.type);
        if (this.current_token.type === PARENTOPEN || this.current_token.type === INTEGER || this.current_token.type === VAR ){
            console.log(this.oper());
        } else if (this.current_token.type === IF) {
            this.constm();
        }else if (this.current_token.type === WHILE){

            this.while();
        }else if(this.current_token.type === VARDEF){
          this.vardef();
          this.eat(END_STATEMENT);
        }else if(this.current_token.type === VARASS){
          this.varass(undefined);
          this.eat(END_STATEMENT);
        }else if (this.current_token.type === FUNCDEF){
         this.funcdef();
        }else if(this.current_token.type === RETURN){
         this.return();
        }else if(this.current_token.type === FUNCCALL){
         this.funccall();
        }else if(this.current_token.type === END_STATEMENT){
           this.advance();
            this.eat(END_STATEMENT);
        }
    }
};
module.exports =Interpreter;
