'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
         allowNull: true,
         type: Sequelize.DATE
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      service_id: { type: Sequelize.INTEGER, references: {
        model: 'services',
        key: 'id',
      }},
      status_id: { type: Sequelize.INTEGER, references: {
        model: 'statuses',
        key: 'id',
      }},
      user_id: { type: Sequelize.INTEGER, references: {
        model: 'users',
        key: 'id',
      }},
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_services');
  }
};
