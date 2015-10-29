/*variable class*/

//initializes the variable with a name and a value
var variable = function(name, value){
    this.name = name;
    this.value = value;
};
//turns the token to a string format "variable(name,value)"
variable.prototype.toString =function (){
    return "Variable("+this.name+", "+this.value+")";
};
module.exports = variable;