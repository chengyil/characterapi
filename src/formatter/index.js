module.exports = {
  createStreamArrayFormatter() {
    let first = true;
    return {
      format(id) {
        let result;
        if (first) {
          first = false;
          result = `[ ${id}`;
        } else {
          result = `, ${id}`;
        }
        return result;
      },
      formatComplete() {
        return ']';
      },
    };
  },
};
