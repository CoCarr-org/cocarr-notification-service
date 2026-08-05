const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// A reusable message template. body/subject support {{var}} interpolation.
const Template = db.define('template', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  channel: { type: DataTypes.ENUM('email', 'sms', 'push', 'any'), allowNull: false, defaultValue: 'any' },
  subject: { type: DataTypes.STRING, allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});
module.exports = Template;
