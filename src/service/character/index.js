// const config = require('config');
const CharacterCache = require('./characterCache');
const {pluck, filter} = require('rxjs/operators');
const config = require('config');
const marvelConfig = config.get('marvel');

class CharacterService {
  constructor() {
    const {hostURL, key, privateKey, ts, refresh} = marvelConfig;
    this.characterCache =
    new CharacterCache(hostURL, key, privateKey, ts, refresh);
  }

  getCharacters() {
    return this.characterCache.getCache();
  }

  getCharacter(id) {
    return this.getCharacters().pipe(
        filter((char) => char['id'] == id),
    );
  }

  getCharactersId() {
    return this.getCharacters().pipe(
        pluck('id'),
    );
  }
};

module.exports = new CharacterService();
