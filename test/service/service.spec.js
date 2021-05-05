const {characterService} = require('@service');
const {from, defer, interval, EMPTY} = require('rxjs');
const {switchMap} = require('rxjs/operators');
const {
  publishReplay,
  refCount,
  take,
} = require('rxjs/operators');

function promisify(fn) {
  return new Promise((resolve, reject) => {
    return fn(resolve, reject);
  });
}

describe('test', () => {
  it('should be able to make request', async () => {
    const data = await characterService.getCharacterIdList();
    expect(data).toHaveLength(1);
  });
  it('should be able to make request', async () => {
    const data = await characterService.getCharacterIdList();
    expect(data).toHaveLength(1);
  });
  it('delayed', () => {
    const data$ = defer(() => from(characterService.getCharacterIdList()))
        .pipe(
            publishReplay(1, 50),
            refCount(),
            take(1),
        );
    const sub2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        data$.subscribe({
          next(data) {
            console.log(data);
            resolve(data);
          },
          error(x) {
            console.log(x);
            reject(x);
          },
        });
      }, 60);
    });
    const sub1 = new Promise((resolve, reject) => {
      data$.subscribe({
        next(data) {
          console.log(data);
          resolve(data);
        },
        error(x) {
          console.log(x);
          reject(x);
        },
      });
    });
    return Promise.all([sub1, sub2]);
  });
  it('getAllCharacters', () => {
    let items = [];
    return promisify((resolve, reject) => {
      characterService.getAllCharactersStream().subscribe({
        next(data) {
          items= [...items, ...data];
        },
        error() {
          reject();
        },
        complete() {
          console.log(items.length);
          resolve();
        },
      });
    });
  });
  it('getIds', () => {
    const items = [];
    return promisify((resolve, reject) => {
      characterService.getCharactersIdStream().subscribe({
        next(data) {
          items.push(data);
        },
        error() {
          reject();
        },
        complete() {
          resolve();
        },
      });
    });
  });

  it('get Character', async () => {
    function generateOffset(total) {
      const offsets = [];
      for (let index = 0; index < total; index = index + 100) {
        offsets.push(index);
      }
      return offsets;
    }
    promisify((resolve, reject) => {
      from([0]).pipe(
          switchMap((total)=> total ? from(generateOffset(total)) : EMPTY),
      ).subscribe({
        next(data) {
          console.log(data);
        },
        error() {
          reject();
        },
        complete() {
          resolve();
        },
      });
    });
  });
});
