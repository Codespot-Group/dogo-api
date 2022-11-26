import Sequelize, { Model } from 'sequelize';

class ServiceType extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'service_type',
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

export default ServiceType;
