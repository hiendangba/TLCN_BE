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
        type: Sequelize.ENUM('BOOKED', 'CONFIRMED', 'CANCELED', 'MOVED'),
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

    await queryInterface.sequelize.query(`
      CREATE TRIGGER room_reg_before_update
      BEFORE UPDATE ON RoomRegistrations
      FOR EACH ROW
      BEGIN
          -- Chỉ tính lại endDate nếu approvedDate khác NULL và status không phải CANCELLED
          IF NEW.approvedDate IS NOT NULL AND NEW.status != 'CANCELED' AND NEW.status != 'MOVED'THEN
              SET NEW.endDate = DATE_ADD(NEW.approvedDate, INTERVAL CAST(NEW.duration AS UNSIGNED) MONTH);
          END IF;
      END;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoomRegistrations');
  }
};
