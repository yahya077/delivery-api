class ErrorResponse{
    constructor(value, msg, param, location, statusCode){
        this.value = value;
        this.msg = msg;
        this.param = param;
        this.location = location;
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;