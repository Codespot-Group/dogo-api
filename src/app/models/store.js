import Sequelize, { Model } from 'sequelize';
import Address from './address';
import Image from './image';
import Service from './service';

class Store extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'store',
        defaultScope: {
          include: [Image,Address,Service],
          attributes: { exclude: ['imageId', 'deleted_at'] },
        }, 
      }
    );

    
    return this;
  }


  static associate(models) {
    this.belongsTo(Image);
    this.belongsTo(Address);  
    this.hasMany(Service);
  }  
}

export default Store;
