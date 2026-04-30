const bcrypt = require('bcryptjs');

let users = [];
let nextId = 1;

module.exports = {
  findByUsername(username) {
    return users.find(u => u.username === username) || null;
  },

  findById(id) {
    return users.find(u => u.id === id) || null;
  },

  async create({ username, password }) {
    if (this.findByUsername(username)) return null;
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: nextId++, username, password: hashed };
    users.push(user);
    return user;
  },

  validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
};
