function Operations() {

}

Operations.prototype.execute = function(value1, operator, value2) {
    if(operator.startsWith('LENGTH')) {
        var valueToCheck = value1.toString().length;
        var tokens = operator.split(' ');
        var secondOperator = tokens[1];
        if(secondOperator === '<=') {
            return valueToCheck <= value2;
        }
        else if(secondOperator === '>') {
            return valueToCheck > value2;
        }
    }
    else if(operator === '=') {
        return value1 == value2;
    }
};