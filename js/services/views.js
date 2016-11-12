function Views() {
    this._setUI();
}

Views.prototype._MAIN_CONTAINER = '#main-container';
Views.prototype._NEXT_BUTTON = '.btn-primary';
Views.prototype._INPUT_QUESTION_ACTION = '#answer';

Views.prototype.$mainContainer = null;
Views.prototype.$nextButton = null;

Views.prototype._PARTIALS_FOLDER = 'partials';
Views.prototype._TEXT_SCENE_PARTIAL = 'textScenePartial.html';
Views.prototype._QUESTION_ACTION_PARTIAL = 'questionActionPartial.html';
Views.prototype._SENTENCE_ACTION_PARTIAL = 'sentenceActionPartial.html';
Views.prototype._MULTIPLE_CHOICE_ACTION_PARTIAL = 'multipleChoiceActionPartial.html';
Views.prototype._MULTIPLE_CHOICE_ACTION_CHOICES_PARTIAL = 'multipleChoiceActionChoicesPartial.html';

Views.prototype._DATA_FOLDER = 'data';
Views.prototype._IMAGE_FOLDER = 'data/img';

Views.prototype._setUI = function() {
    this.$mainContainer = $(this._MAIN_CONTAINER);
    this.$nextButton = $(this._NEXT_BUTTON).hide();
};

Views.prototype._scrollToBottom = function() {
    window.scrollTo(0,document.body.scrollHeight);
};

Views.prototype.setNextHandler = function(handler) {
    this.$nextButton.off('click');
    this.$nextButton.on('click', handler);
};

Views.prototype.renderTextScene = function(scene) {
    this.$nextButton.hide();
    var text = scene.text;
    var self = this;
    $.get(this._PARTIALS_FOLDER + '/' + this._TEXT_SCENE_PARTIAL)
        .done(function(partial){
            partial = partial.replaceAll('{text}', text);
            self.$mainContainer.append(partial);
            self.$nextButton.show();
            self._scrollToBottom();
        })
        .fail(function() {
            console.error('Ha ocurrido un error al recuperar el partial de escenas de tipo TextScene');
        })
};

Views.prototype.renderQuestionAction = function(action) {
    this.$nextButton.hide();
    var self = this;
    $.get(this._PARTIALS_FOLDER + '/' + this._QUESTION_ACTION_PARTIAL)
        .done(function(partial) {
            partial = partial.replaceAll('{img}', self._IMAGE_FOLDER + '/' + action.who.img);
            partial = partial.replaceAll('{name}', action.who.name);
            partial = partial.replaceAll('{question}', action.question);
            self.$mainContainer.append(partial);
            self.$nextButton.show();
            self._scrollToBottom();
        })
        .fail(function() {
            console.error('Ha ocurrido un error al recuperar el partial de acciones de tipo QuestionAction');
        });
};

Views.prototype.renderSentenceAction = function(action) {
    this.$nextButton.hide();
    var self = this;
    $.get(this._PARTIALS_FOLDER + '/' + this._SENTENCE_ACTION_PARTIAL)
        .done(function(partial) {
            if(action.who.id === 'PLAYER') action.who = Director.config.getPlayer();
            partial = partial.replaceAll('{img}', self._IMAGE_FOLDER + '/' + action.who.img);
            partial = partial.replaceAll('{name}', action.who.name);
            partial = partial.replaceAll('{text}', action.text);
            partial = self._replaceWithConfigField(partial);
            self.$mainContainer.append(partial);
            self.$nextButton.show();
            self._scrollToBottom();
        })
        .fail(function() {
            console.error('Ha ocurrido un error al recuperar el partial de acciones de tipo SentenceAction');
        });
};

Views.prototype.renderMultipleChoiceAction = function(action, callback) {
    this.$nextButton.hide();
    var self = this;
    $.get(this._PARTIALS_FOLDER + '/' + this._MULTIPLE_CHOICE_ACTION_PARTIAL)
        .done(function(partial) {
            partial = partial.replaceAll('{img}', self._IMAGE_FOLDER + '/' + action.who.img);
            partial = partial.replaceAll('{name}', action.who.name);
            partial = partial.replaceAll('{question}', action.question);
            partial = self._replaceWithConfigField(partial);
            var $partial = $(partial);
            self.$mainContainer.append($partial);
            var choices = action.choices;
            choices.forEach(function(choice) {
                (function(choice) {
                    $.get(self._PARTIALS_FOLDER + '/' + self._MULTIPLE_CHOICE_ACTION_CHOICES_PARTIAL)
                        .done(function (partial) {
                            partial = partial.replaceAll('{answer}', choice.answer);
                            var $button = $(partial);
                            $button.click(function() {
                                var $this = $(this);
                                var consequence =  choice.consequence;
                                var newConfig = consequence.newConfig;
                                for(key in newConfig) {
                                    Director.config.set(key, newConfig[key]);
                                    $this.parent().find('button').prop('disabled', true);
                                    callback();
                                }
                            });
                            $partial.find('#choices').append($button);
                            self._scrollToBottom();
                        })
                        .fail(function () {
                            console.error('Ha ocurrido un error al recuperar el partial de choices de una acción de tipo MultipleChoiceAction')
                        });
                })(choice);
            });
        })
        .fail(function() {
            console.error('Ha ocurrido un error al recuperar el partial de acciones de tipo MultipleChoiceAction')
        });
};

Views.prototype.getAnswer = function(action) {
    if(action.type === 'question-action') {
        return $(this._INPUT_QUESTION_ACTION).val();
    }
};

Views.prototype.disableAnswer = function() {
    $(this._INPUT_QUESTION_ACTION).prop('disabled', true);
};

Views.prototype._replaceWithConfigField = function(partial) {
    var fields = partial.match(/{([^}]*)}/);
    if(!fields) return partial;
    fields.forEach(function(item) {
        if(!item.startsWith('{')){
            var value = Director.config.get(item);
            partial = partial.replaceAll('{'+ item +'}', value);
        }
    });

    return partial;
};

Views.prototype.stop = function() {
    this.$nextButton.hide();
};