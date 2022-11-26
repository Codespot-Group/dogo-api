import Sequelize, { Model } from 'sequelize';
import Image from './image';
import Store from './store';
import ServiceType from './service_types';

class Service extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description:Sequelize.STRING,
        price:Sequelize.DOUBLE
      },
      {
        sequelize,
        modelName: 'service',
        defaultScope: {
          include: [Image, ServiceType],
          attributes: { exclude: ['imageId', 'deleted_at'] },
        }, 
        scopes: {
          withStore: {
            include: [Image, ServiceType, Store],
            cattributes: { exclude: ['imageId', 'deleted_at'] },
          }
        }
      }
    );
    return this;
  }

  
  static associate(models) {
    this.belongsTo(Image);  
    this.belongsTo(Store);
    this.belongsTo(ServiceType)
  }  
}

export default Service;
