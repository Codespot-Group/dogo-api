import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import Address from './address';
import Image from './image';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'user',
        defaultScope: {
          include: [Image],
          attributes: { exclude: ['imageId', 'deleted_at'] },
        }, 
        scopes: {
          withoutPassword: {
            attributes: { exclude: ['password_hash'] }
          }
        }
      }
    );

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  static associate(models) {
    this.belongsTo(Image);  
  }  
}

export default User;
