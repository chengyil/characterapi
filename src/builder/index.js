const {Response, CharacterDto} = require('@model');

module.exports = {
  buildOkResponse(value) {
    const status = 'ok';
    return new Response(status, value);
  },

  buildErrorResponse(error) {
    const status = 'error';
    return new Response(status, {
      code: error.code,
      message: error.message,
    });
  },

  buildCharacterDto(character) {
    const dto = new CharacterDto();
    dto.name = character.name;
    dto.id = character.id;
    dto.description = character.description;
    return dto;
  },
};
