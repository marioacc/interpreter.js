
var Token = require("./token.js");
var Exception = require ("./exceptions.js");
var variable = require ("./variable.js");

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
var VARDEF = "VARDEF";
var VARASS = "VARASS";
var VAR = "VAR";
var END_STATEMENT= "END_STATEMENT";
var PARENTESHIS = []; //parenteSHIS? jajaja
//variables super awsome stack
var varstack= new Array();
//RESERVED DICTTIONARIES
var var_reserved = ["=", "var"];
var cs_reserved = ["if", "else", "while", "for"]; 
var RESERVED = [var_reserved,cs_reserved];
var IF="IF";



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
            console.log("New variable: " + this_new_var.name+ "created successfully");
         }else {this.error("You used a reserved word, dont be that guy plz: Line 76");}
      }
      variable_name += this.current_char;
      this.advance();
      if(this.current_char === ";"){
         break; 
      } 
   }
   if(RESERVED.indexOf(variable_name) === -1){
      var this_new_var = new variable(variable_name, undefined);
      varstack.push(this_new_var);
      this.eat(VARDEF);
      
      console.log("New variable: " + this_new_var.name+ "created successfully");
   }else {this.error("U used a reserved word man, plz dont be an ass...Line 93");} 
};
//Read variable assigination 
Interpreter.prototype.varass = function (varname) { 
   var variable_name;
   if(varname === undefined){
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
//Lexical Analyzer
Interpreter.prototype.tokenizer= function (){
    "use strict";
    //A while method to get all the elements in the statement and make the tokens

    while (this.current_char !== undefined) {
         var regex_varass = /[a-z]\S*=/;
         var substring = this.text.substr(this.pos, 3); 
         var isRegex = regex_varass.test(this.text.substr(this.pos,3));
       if(this.current_char === ";"){
            return new Token(END_STATEMENT, ";");
         }
       
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
        if (this.text.substr(this.pos,3)==="var"){
            this.advance(3);
            return new Token(VARDEF, "vardef");
        }
       if(isRegex){ 
            return new Token (VARASS, "varass"); 
            break;
       }  
        if (this.isOnVarstack(this.current_char) && !isRegex){
            return new Token(VAR, this.getVarValue());
        }

        if (this.text.substr(this.pos,2)==="if"){
            this.advance(2);
            return new Token(IF,"if");
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
//Factor = integer or var
Interpreter.prototype.factor = function () {
    var token = this.current_token;
   if(this.current_token.type === INTEGER){
       this.eat(INTEGER);
       return token.value;
   }
   if(this.current_token.type === VAR){
      var token_var = token.value;
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
    }else if (this.current_token.type === INTEGER){
        result = this.superterm();
    }
    while ([PLUS,MINUS,PARENTCLOSE].indexOf(this.current_token.type) !== -1 ){
        var token = this.current_token;
        if (token.type === PARENTCLOSE){
            this.eat(PARENTCLOSE);
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
    return result;
};  
Interpreter.prototype.expr = function (){
    //expr -> INTEGER PLUS INTEGER
    //set current token to the first token taken from the input
    "use strict";
    this.current_token = this.tokenizer();
   {
    if (this.current_token.type === PARENTOPEN || this.current_token.type === INTEGER || this.current_token.type === VAR ){
        return this.oper();
    } else if (this.current_token.type === IF) {
        console.log(this.current_char);
    }
   if(this.current_token.type === VARDEF){
      this.vardef();
   }
   if(this.current_token.type === VARASS){
      this.varass(undefined);
   }
   if(this.current_token.type === END_STATEMENT){
      this.eat(END_STATEMENT);
      this.advance();    
      return this.expr();
   }
   }
};

module.exports =Interpreter;
