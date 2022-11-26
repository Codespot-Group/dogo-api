import Sequelize, { Model } from 'sequelize';
import Image from './image';
import Breed from './breed';
import User from './user';

class Pet extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'pet',
        defaultScope: {
            include: [Breed, Image, User.scope('withoutPassword')],
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
    this.belongsTo(Breed);
    this.belongsTo(User);
  }
}

export default Pet;
