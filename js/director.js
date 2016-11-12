$(document).ready(function() {
    new Director();
});

function Director() {
    this._setServices();
    var self = this;
    this._sceneService.loaded.done(function() {
        self._start();
    });
}

Director.config = new Config();

Director.prototype._sceneService = null;
Director.prototype._viewService = null;
Director.prototype._actionService = null;

Director.prototype._currentScene = null;
Director.prototype._currentAction = null;

Director.prototype._setServices = function() {
    this._sceneService = new Scenes();
    this._viewService = new Views();
    this._actionService = new Actions()
};

Director.prototype._start = function() {
    this._currentScene = this._sceneService.getFirstScene();
    this._executeScenes();
};

Director.prototype._executeScenes = function() {
    if(this._currentScene) {
        if(this._currentScene.actions) {
            this._actionService.setActions(this._currentScene.actions);
            this._currentAction = this._actionService.getFirstAction();
            this._executeActions();
        }
        else {
            this._runScene(this._currentScene);
            var self = this;
            this._viewService.setNextHandler(function() {
                self._currentScene = self._sceneService.getNextScene(self._currentScene);
                self._executeScenes();
            });
        }
    }
    else {
        this._viewService.stop();
        console.log('THE END... FOR NOW');
    }
};

Director.prototype._runScene = function(scene) {
    if(scene.type === 'text-scene') {
        this._runTextScene(scene);
    }
};

Director.prototype._runTextScene = function(scene) {
    this._viewService.renderTextScene(scene);
};

Director.prototype._executeActions = function() {
    if(this._currentAction) {
        this._runAction(this._currentAction);
    }
};

Director.prototype._runAction = function(action) {
    if(action.type === 'question-action') {
        this._runQuestionAction(action);
    }
    else if(action.type === 'sentence-action') {
        this._runSentenceAction(action);
    }
    else if(action.type === 'multiple-choice-action') {
        this._runMultipleChoiceAction(action);
    }
};

Director.prototype._runQuestionAction = function(action) {
    this._viewService.renderQuestionAction(action);
    var self = this;
    this._viewService.setNextHandler(function() {
        var answer = self._viewService.getAnswer(action);
        if(!answer.trim()) return false;
        self._viewService.disableAnswer();
        Director.config.set(action.configField, answer);
        if(action.configField === 'PLAYER_NAME') {
            Director.config.getPlayer().name = answer;
        }
        self._currentAction = self._actionService.getNextAction(self._currentAction);
        self._executeActions();
        return true;
    });
};

Director.prototype._runSentenceAction = function(action) {
    this._viewService.renderSentenceAction(action);
    var self = this;
    this._viewService.setNextHandler(function() {
        if(self._currentAction) {
            self._currentAction = self._actionService.getNextAction(self._currentAction);
            self._executeActions();
        }
        else{
            self._currentScene = self._sceneService.getNextScene(self._currentScene);
            self._executeScenes();
        }
    });
};

Director.prototype._runMultipleChoiceAction = function(action) {
    var self = this;
    this._viewService.renderMultipleChoiceAction(action, function() {
        self._currentAction = self._actionService.getNextAction(self._currentAction);
        self._executeActions();
    });
};