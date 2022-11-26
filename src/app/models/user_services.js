import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import Status from './status'
import Service from './service';
import User from './user';

class UserService extends Model {
  static init(sequelize) {
    super.init(
      {
        price: Sequelize.DOUBLE,
      },
      {
        sequelize,
        modelName: 'user_service',
        defaultScope: {
          include: [User.scope('withoutPassword'), Service, Status],
          attributes: { exclude: ['deleted_at'] },
        }, 
      }
    );


    return this;
  }


  static associate(models) { 
    this.belongsTo(User)
    this.belongsTo(Service) 
    this.belongsTo(Status) ;
  }  
}

export default UserService;
