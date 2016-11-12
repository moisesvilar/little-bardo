function Transitions(){
    this._statesService = new States();
}

Transitions.prototype.whatTransitionFit = function(transitions) {
    var result = null;
    var self = this;
    transitions.forEach(function(item) {
        if(!result) {
            if(self._statesService.check(item.requiredState)) result = item;
        }
    });

    return result;
};