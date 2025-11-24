'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoomRegistrations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      registerDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      approvedDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      duration: Sequelize.STRING,
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'BOOKED', 'CONFIRMED', 'CANCELED', 'MOVE_PENDING', 'MOVED', 'EXTENDING', 'PENDING_EXTENDED', 'EXTENDED'),
        defaultValue: 'BOOKED',
        allowNull: false
      },
      roomSlotId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'RoomSlots',
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
    await queryInterface.dropTable('RoomRegistrations');
  }
};
