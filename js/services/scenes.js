function Scenes(){
    this._transitionService = new Transitions();
    this._loadScenes();
}

Scenes.prototype.loaded = $.Deferred();

Scenes.prototype._STORY_JSON_FILE = 'data/story.json';
Scenes.prototype._story = null;

Scenes.prototype.getFirstScene = function() {
    return this.getScene('START');
};

Scenes.prototype.getScene = function(id) {
    return this._story[id];
};

Scenes.prototype._loadScenes = function() {
    var self = this;
    $.get(this._STORY_JSON_FILE)
        .done(function(data) {
            self._story = JSON.parse(data);
            self.loaded.resolve();
        })
        .fail(function(request) {
            console.log(request);
            console.error('Ha ocurrido un error al intentar cargar la historia');
        });
};

Scenes.prototype.getNextScene = function(currentScene) {
    var transitions = currentScene.transitions;
    if(!transitions || transitions.length <= 0) return null;
    if(transitions.length == 1) return this.getScene(transitions[0].target);
    var transition = this._transitionService.whatTransitionFit(transitions);
    return this.getScene(transition.target);
};