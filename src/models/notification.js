const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db');
// A single delivery attempt/record across a channel.
const Notification = db.define('notification', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => uuidv4() },
  channel: { type: DataTypes.ENUM('email', 'sms', 'push'), allowNull: false },
  to: { type: DataTypes.STRING, allowNull: false }, // email address, phone, or device push token
  principalId: { type: DataTypes.STRING, allowNull: true },
  templateKey: { type: DataTypes.STRING, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: true },
  data: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.ENUM('queued', 'sent', 'simulated', 'failed'), allowNull: false, defaultValue: 'queued' },
  providerId: { type: DataTypes.STRING, allowNull: true },
  error: { type: DataTypes.STRING, allowNull: true },
  sentAt: { type: DataTypes.DATE, allowNull: true },
}, { indexes: [{ fields: ['status'] }, { fields: ['channel'] }, { fields: ['principalId'] }] });
module.exports = Notification;
