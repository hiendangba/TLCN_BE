'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MeterReadings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      type: Sequelize.STRING,
      oldValue: Sequelize.FLOAT,
      newValue: Sequelize.FLOAT,
      unitPrice: Sequelize.DECIMAL,
      totalAmount: Sequelize.DECIMAL,
      readingDate: Sequelize.DATE,
      roomId: {
        type: Sequelize.UUID,
        references: { model: 'Rooms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MeterReadings');
  }
};
