import Sequelize, { Model } from 'sequelize';
import Image from './image';

class PetType extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING
      },
      {
        sequelize,
        modelName: 'pet_type',
        defaultScope: {
            include: [Image],
          attributes: { 
            exclude: ['deleted_at'],
          },
        }, 
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(Image);
  }
}

export default PetType;
