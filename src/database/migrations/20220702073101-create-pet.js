'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      image_id: { type: Sequelize.INTEGER, references: {
        model: 'images',
        key: 'id',
      }},
      breed_id: { type: Sequelize.INTEGER, references: {
        model: 'breeds',
        key: 'id',
      }},
      user_id: { type: Sequelize.INTEGER, references: {
        model: 'users',
        key: 'id',
      }},
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
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('pets');
  }
};
