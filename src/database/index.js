import Sequelize from 'sequelize';
import Image from '../app/models/image';

import UserImage from '../app/models/user_image';
import databaseConfig from '../config/database';

const models = 
  [
  Image, 
    UserImage,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
