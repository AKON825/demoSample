module.exports = {
      /* 資料庫 */
    database: {
      'host': '127.0.0.1',
      'name': 'kiwi',
      'user': 'root',
      'password': 'GLNUT7FF9'
    },

    redis: {
      host: '127.0.0.1',
      port: 6379,
      session: {
        db: 2,
        ttl: 60000,
        prefix: 'demo_sess_'
      }
    }
}
