module.exports = {
  getDBProperties: function() {
      let prop = {
          client: 'mysql',
          connection: {
              host: '14.63.168.58',
              user: 'chatbot',
              password: 'chatbot',
              database: 'gandeurak'
          }
      }
      return prop;
  }
};