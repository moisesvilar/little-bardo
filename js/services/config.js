function Config() {

}

Config.prototype._config = {
    player: {
        'img': 'player.jpg'
    }
};

Config.prototype.set = function(field, value) {
    this._config[field] = value;
};

Config.prototype.get = function(field) {
    return this._config[field];
};

Config.prototype.getPlayer = function() {
    return this._config['player'];
}