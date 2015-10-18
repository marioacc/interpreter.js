var Exception = function (message){
    "use strict";
    this.message = message;
    this.name = "Parsing Exception";
};

module.exports = Exception;
