const {from, timer} = require('rxjs');
const {catchError, tap, switchMap, shareReplay} = require('rxjs/operators');
const logger = require('@logger');

const STATE = {
  EMPTY: 'EMPTY',
  PENDING: 'PENDING',
  COMPLETE: 'COMPLETE',
};

module.exports = class Cache {
  constructor(refresh) {
    this.refreshPeriod= Number(refresh);
    logger.info(this.refreshPeriod, this.refresh);
    this.cache = {};
    this.lastUpdateOn = null;
    this.state = STATE.EMPTY;
    this.update$ = null;
    this.init$ = null;
    this.pending$ = null;
  }

  getLastUpdatedOn() {
    return this.lastUpdateOn.toISOString();
  }

  setOnFirstRequest(onFirstRequest) {
    this.init$ = onFirstRequest();
  }

  setOnRefresh(onRefresh) {
    this.update$ = timer(0, this.refreshPeriod)
        .pipe(
            // eslint-disable-next-line max-len
            tap(() => logger.info(`refreshing, last modified date on ${this.getLastUpdatedOn()}`)),
            switchMap(() => onRefresh(this.getLastUpdatedOn()).pipe(
                catchError((error) => {
                  logger.error('unable to update', {error});
                  return from([]);
                }),
            )),
        );
  }

  initCache() {
    this.state = STATE.PENDING;
    this.pending$ = this.init$.pipe(shareReplay());
    this.pending$.subscribe({
      next: (char) => {
        this.cache[char['id']] = char;
      },
      complete: () => {
        this.lastUpdateOn = new Date();
        this.state = STATE.COMPLETE;
        this.pending$ = null;
        this.startKeepFreshTimer();
      },
      error: () => {
        logger.error('Unable to initialize cache');
        this.state = STATE.EMPTY;
        this.pending$ = null;
        this.cache = {};
      },
    });
  }

  startKeepFreshTimer() {
    this.update$.subscribe({
      next: (char) => {
        this.lastUpdateOn = new Date();
        this.cache[char['id']] = char;
      },
    });
  }

  isReady() {
    return this.state === STATE.COMPLETE;
  }

  isNew() {
    return this.state === STATE.EMPTY;
  }

  getCache() {
    if (this.isNew()) {
      logger.info('from api');
      this.initCache();
      return this.init$;
    } else if (this.isReady()) {
      logger.info('from cache');
      return from(Object.values(this.cache));
    } else {
      logger.info('from pending');
      return this.init$;
    }
  }
};
