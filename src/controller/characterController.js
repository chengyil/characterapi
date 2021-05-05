const {characterService} = require('@service');
const {buildOkResponse, buildCharacterDto} = require('@builder');
const {createStreamArrayFormatter} = require('@formatter');
const {asyncScheduler} = require('rxjs');
const {observeOn} = require('rxjs/operators');
const logger = require('@logger');
const {NotFoundError, ErrorResponse} = require('@error');
const {buildErrorResponse} = require('@builder');

module.exports = {
  list(req, res) {
    const formatter = createStreamArrayFormatter();
    const subscription = characterService.getCharactersId()
        .pipe(
            observeOn(asyncScheduler),
        )
        .subscribe({
          next(id) {
            res.write(formatter.format(id));
          },
          complete() {
            res.write(formatter.formatComplete());
            res.end();
          },
          error() {
            res.write(
                JSON.stringify(buildErrorResponse(
                    new ErrorResponse('Server Error'),
                )),
            );
            res.end();
          },
        });
    res.set('Content-Type', 'application/stream+json');
    req.on('close', () => subscription.unsubscribe());
  },

  async get(req, res) {
    try {
      const characterId = req.params.id;
      const character = await characterService
          .getCharacter(characterId).toPromise();
      if (!character) throw new NotFoundError('Unable to find such character');
      res.send(buildOkResponse(buildCharacterDto(character)));
    } catch (error) {
      logger.error('Failed due to ', {error});
      res.send(buildErrorResponse(error));
    }
  },
};
