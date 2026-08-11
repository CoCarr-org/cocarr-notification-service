// BASELINE — the schema as it stood when migrations were adopted.
//
// Creates each table ONLY if absent, and is recorded as applied either way.
// Two very different databases both have to end up correct:
//
//   FRESH      no tables            -> create them
//   EXISTING   tables already built  -> create nothing, just record that the
//              by db.sync(alter)        schema is at least at baseline
//
// Blindly running CREATE TABLE against a deployed environment fails; skipping
// the record instead leaves the database looking un-migrated forever, so every
// later deploy would retry the baseline and fail again.
//
// Transcribed from the models as they stand today, using the QueryInterface
// and never importing them. Models describe the CURRENT shape; this file must
// describe the shape at ITS point in history, or replaying it later builds
// whatever the models happen to say then.

const TABLES = ['notifications', 'templates'];

const TIMESTAMPS = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.showAllTables();
    const have = new Set(existing.map((t) => (typeof t === 'string' ? t : t.tableName)));

    if (!TABLES.some((t) => !have.has(t))) return;

    if (!have.has('notifications')) {
      await queryInterface.createTable('notifications', {
        id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        channel: { type: Sequelize.ENUM('email', 'sms', 'push'), allowNull: false },
        // email address, phone, or device push token
        to: { type: Sequelize.STRING, allowNull: false },
        principalId: { type: Sequelize.STRING, allowNull: true },
        templateKey: { type: Sequelize.STRING, allowNull: true },
        subject: { type: Sequelize.STRING, allowNull: true },
        body: { type: Sequelize.TEXT, allowNull: true },
        data: { type: Sequelize.JSON, allowNull: true },
        status: {
          type: Sequelize.ENUM('queued', 'sent', 'simulated', 'failed'),
          allowNull: false,
          defaultValue: 'queued',
        },
        providerId: { type: Sequelize.STRING, allowNull: true },
        error: { type: Sequelize.STRING, allowNull: true },
        sentAt: { type: Sequelize.DATE, allowNull: true },
        ...TIMESTAMPS(Sequelize),
      });
      // Named explicitly: Sequelize auto-names indexes differently per
      // environment, and an index you cannot name is one you cannot drop.
      await queryInterface.addIndex('notifications', ['status'], { name: 'notifications_status' });
      await queryInterface.addIndex('notifications', ['channel'], { name: 'notifications_channel' });
      await queryInterface.addIndex('notifications', ['principalId'], { name: 'notifications_principal_id' });
    }

    if (!have.has('templates')) {
      await queryInterface.createTable('templates', {
        id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        key: { type: Sequelize.STRING, allowNull: false, unique: true },
        name: { type: Sequelize.STRING, allowNull: false },
        channel: {
          type: Sequelize.ENUM('email', 'sms', 'push', 'any'),
          allowNull: false,
          defaultValue: 'any',
        },
        subject: { type: Sequelize.STRING, allowNull: true },
        body: { type: Sequelize.TEXT, allowNull: false },
        isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
        ...TIMESTAMPS(Sequelize),
      });
    }
  },

  // DELIBERATELY REFUSES. Rolling back a baseline drops every table in the
  // service — every notification and template. No pipeline should reach that by
  // running `migrate:down` one step too many.
  async down() {
    throw new Error(
      'The baseline cannot be rolled back — it would drop every notification and template. '
      + 'Restore from a backup instead.',
    );
  },
};
