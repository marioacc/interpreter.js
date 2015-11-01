/*function class*/

/*Require interpreter to use its methods, since the func can almost do them all because its awsome*/
var interpreter = require ("./interpreter.js");
//initializes the variable with a name and a value
var function_var = function (name, beggining,text,end){
   //"use strict";
   this.name =name;
   this.beggining= beggining;
   this.text = text;
   this.end =end;
};

function_var.prototype.tokenizer = function (){
  interpreter.tokenizer
};
function_var.prototype.toString = function() {
   return this.name + " with beggining in: "+this.beggining +" and end in: " + this.end;
}

module.exports = function_var;  