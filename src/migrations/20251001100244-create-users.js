'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      identification: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      dob: Sequelize.DATE,
      gender: Sequelize.STRING,
      phone: { type: Sequelize.STRING, unique: true },
      email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
      nation: Sequelize.STRING,
      apostate: Sequelize.STRING,
      address: Sequelize.STRING,
      status: Sequelize.STRING,
      avatar: Sequelize.STRING,
      frontIdentificationImage: Sequelize.STRING,
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
    await queryInterface.dropTable('Users');
  }
};
