'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Students', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      identification: { type: Sequelize.STRING, allowNull: false, },
      password: { type: Sequelize.STRING, allowNull: false },
      dob: Sequelize.DATE,
      gender: Sequelize.STRING,
      phone: { type: Sequelize.STRING, unique: true },
      email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
      nation: Sequelize.STRING,
      apostate: Sequelize.STRING,
      mssv: { type: Sequelize.STRING, allowNull: false, unique: true },
      school: { type: Sequelize.STRING, allowNull: true },
      // Foreign key từ belongsTo Face 
      faceId: { type: Sequelize.UUID, references: { model: 'Faces', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE', allowNull: true },
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
    await queryInterface.dropTable('Students');
  }
};
