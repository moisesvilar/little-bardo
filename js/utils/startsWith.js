String.prototype.startsWith = function(needle) {
    return this.match("^" + needle);
};