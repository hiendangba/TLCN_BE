'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MeterReadings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      type: {
        type: Sequelize.STRING, // "electricity" hoặc "water"
        allowNull: false
      },
      oldValue: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      newValue: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(15, 0), // nếu muốn nguyên số và đủ lớn
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(15, 0), // tương tự unitPrice
        allowNull: false
      },
      period: {
        type: Sequelize.CHAR(7), // format: "YYYY-MM"
        allowNull: false,
      },
      readingDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      roomId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        },
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
