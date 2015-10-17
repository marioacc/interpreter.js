/*Token class*/

//initializes the token with a type and a value
var Token = function(type, value){
    this.type = type;
    this.value = value;
};
//turns the token to a string format "Token(type,value)"
Token.prototype.toString =function (){
    return "Token("+this.type+", "+this.value+")";
};
