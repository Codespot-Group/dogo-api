'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      image_id: { type: Sequelize.INTEGER, references: {
        model: 'images',
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
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      service_type_id: { type: Sequelize.INTEGER, references: {
        model: 'service_types',
        key: 'id',
      }},
      store_id: { type: Sequelize.INTEGER, references: {
        model: 'stores',
        key: 'id',
      }}
      
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('services');
  }
};
