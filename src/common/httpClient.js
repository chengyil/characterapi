const axios = require('axios').default;
module.exports = {
  get({url}) {
    return axios({
      method: 'get',
      url,
    });
  },
};
