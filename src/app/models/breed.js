import Sequelize, { Model } from 'sequelize';
import PetType from './pet_type';

class Breed extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'breed',
        defaultScope: {
            include: [PetType],
          attributes: { 
            exclude: ['deleted_at'],
          },
        }, 
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(PetType);
  }
}

export default Breed;
