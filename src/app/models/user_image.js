import Sequelize, { Model } from 'sequelize';
import Image from './image';

class UserImage extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
      },
      {
        sequelize,
        modelName: 'user_image',
        defaultScope: {
          includes: [Image],
          attributes: { exclude: ['deleted_at'] },
        }
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(Image)
  }
}

export default UserImage;
