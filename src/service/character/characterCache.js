const crypto = require('crypto');
const {httpClient, Cache} = require('@common');
const {from, EMPTY, defer} = require('rxjs');
const {pluck, mergeMap, mergeAll, switchMap} = require('rxjs/operators');
const logger = require('@logger');

module.exports = class CharacterCache extends Cache {
  constructor(hostUrl, key, privateKey, ts, refresh) {
    super(refresh);
    this.hostUrl = hostUrl;
    this.key = key;
    this.privateKey = privateKey;
    this.ts = ts;
    this.hash = this.calculateHash(ts, privateKey, key);
    this.setOnFirstRequest(() =>
      defer(() => this.getAllCharactersStream()));
    this.setOnRefresh(
        (lastUpdateOn) => defer(() => this.getAllCharactersStream(
            {modifiedSince: lastUpdateOn})),
    );
  }

  calculateHash(ts, privateKey, key) {
    const beforeHash = `${ts}${privateKey}${key}`;
    const after = crypto.createHash('md5')
        .update(beforeHash).digest('hex');
    return after;
  }

  fromApi(offset, limit, filters = {} ) {
    const url = new URL('/v1/public/characters', this.hostUrl);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', limit);
    url.searchParams.set('apikey', this.key);
    url.searchParams.set('ts', this.ts);
    url.searchParams.set('hash', this.hash);
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.set(key, value);
    }
    return from(httpClient.get({url: url.toString()}).then(({data}) => data));
  }

  characterOffsets(filters={}) {
    function generateOffset(total) {
      const offsets = [];
      for (let index = 0; index < total; index = index + 100) {
        offsets.push(index);
      }
      return offsets;
    }
    return this.fromApi(0, 1, filters)
        .pipe(
            pluck('data', 'total'),
            switchMap((total)=> total ? from(generateOffset(total)) : EMPTY),
        );
  }

  getAllCharactersStream(filters = {}) {
    return this.characterOffsets(filters)
        .pipe(
            mergeMap((offset) =>
              this.fromApi(offset, 100, filters), 5),
            pluck('data', 'results'),
            mergeAll(),
        );
  }
};
