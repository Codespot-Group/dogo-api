import Sequelize, { Model } from 'sequelize';

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        street: Sequelize.STRING,
        number: Sequelize.STRING,
        district: Sequelize.STRING,
        zip: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        country: Sequelize.STRING,
        complement: Sequelize.STRING,
        lat: Sequelize.FLOAT,
        lng: Sequelize.FLOAT
      },
      {
        sequelize,
        modelName: 'address',
        defaultScope: {
          attributes: { 
            exclude: ['deleted_at'],
          },
        }, 
      }
    );

    return this;
  }

  static associate(models) {
    
  }
}

export default Address;
