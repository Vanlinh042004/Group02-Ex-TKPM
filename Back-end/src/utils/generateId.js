function generateId(name) {
    return name
        .split(' ')
        .filter(function (word) { return word.trim() !== ''; })
        .map(function (word) { return word[0].toUpperCase(); })
        .join('');
}


module.exports = generateId;

