function States() {
    this._operationsService = new Operations();
}

States.prototype.check = function(state) {
    var value1 = Director.config.get(state.field);
    var operator = state.operator;
    var value2 = state.value;
    return this._operationsService.execute(value1, operator, value2);
};