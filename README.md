# Character API

## Setting up
1) Use at least node version : v11
2) run 
``` bash
npm install
```
3) setup .env file
export MARVEL_URL=https://gateway.marvel.com
export MARVEL_KEY=public_key
export MARVEL_PRIVATE_KEY=private_key
export MARVEL_TS=any_random_key
export MARVEL_REFRESH=60 * 60 * 24 * 1000 // numeric milliseconds to determine when to check marvel for updates

## To run
```bash
npm run start
```
- api-docs
/api-docs

- listing api
/api/v1/characters

- character detail api
/api/v1/characters/{:id}

## Caching Strategy
Read through, embedded caching.

When there is a read request for ids or to a specific character,
we would hit the cache to see if there is initialize.
If it is not, the cache would call populate itself.
During this setting up phase, the stream that initialize the cache
will be used to serve any incoming requests via stream/replay.

After the cache is completed, it will serve subsequent requests from
it embedded cache and a timer will be setup every N millisecond
to query the Marvel API, for changes.

To validate if there is any new changes, right now we are providing a
modifiedSince attribute to check if there any update.

Enhancement: 
 - We can improve how we check for new changes, by storing and using the ETag.
 - We can also better scale this if we split the read and write process into different services.


