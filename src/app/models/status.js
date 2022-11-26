import Sequelize, { Model } from 'sequelize';

class Status extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'status',
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

export default Status;
