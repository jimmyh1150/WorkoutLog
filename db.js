const Sequelize = require('sequelize');

const sequelize = new Sequelize("postgres://postgres:69df4f47b9ab4c8b910d6753b0c5b6f0@localhost:5432/workout_log");

module.exports = sequelize;