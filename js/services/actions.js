function Actions(){
    this._transitionService = new Transitions();
}

Actions.prototype._actions = null;

Actions.prototype.setActions = function(actions) {
    this._actions = actions;
};

Actions.prototype.getFirstAction = function() {
    return this.getAction('START');
};

Actions.prototype.getAction = function(id) {
    return this._actions[id];
};

Actions.prototype.getNextAction = function(currentAction) {
    var transitions = currentAction.transitions;
    if(!transitions || transitions.length <= 0) return null;
    if(transitions.length == 1) return this.getAction(transitions[0].target);
    var transition = this._transitionService.whatTransitionFit(transitions);
    return this._actions[transition.target];
};