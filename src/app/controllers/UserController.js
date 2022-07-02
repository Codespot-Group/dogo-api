import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/user';
import Image from '../models/image';
import jwt from 'jsonwebtoken';
import auth from '../middlewares/auth';
import Address from '../models/address';
import db from '../../database';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    let user = await User.findOne({ where: { email: req.body.email } });

    if (user) {
      return res
        .status(400)
        .json({ message: 'Existe outra conta com esse email' });
    }

    if (req.body.code) {
      user = await User.findOne({ where: { code: req.body.code } });

      if (user) {
        return res
          .status(400)
          .json({ message: 'Existe outra conta com esse código de acesso' });
      }
    }

    let {
      first_name,
      last_name,
      cpf,
      rg,
      email,
      password,
      phone,
      user_type_id,
      store_id,
      code,
      address,
      image,
    } = req.body;

    if (!user_type_id) {
      user_type_id = 2;
    }

    var includes = [];

    if (image) {
      includes.push(Image);
    }

    if (address) {
      includes.push(Address);
    }

    user = await User.create(
      {
        first_name,
        last_name,
        cpf,
        address,
        rg,
        email,
        password,
        storeId: store_id,
        phone,
        code,
        privacyPolicyId: 2,
        termUseId: 2,
        userTypeId: user_type_id,
        image,
      },
      {
        include: includes,
      }
    );

    user = await User.findByPk(user.id);

    user = user.toJSON();
    user.password_hash = undefined;
    user.follow_number = await UserFollow.count({
      where: {
        from_user_id: user.id,
      },
    });
    user.followed_number = await UserFollow.count({
      where: {
        to_user_id: user.id,
      },
    });

    return res.status(200).json(user);
  }

  async index(req, res) {
    // #swagger.tags = ['User']

    var limit = req.query.limit
      ? (limit = parseInt(req.query.limit))
      : undefined;

    var offset = req.query.offset
      ? (offset = parseInt(req.query.offset))
      : undefined;

    var where = {};
    if (req.query.query) {
      where.first_name = {
        [Op.like]: '%' + req.query.query + '%',
      };
    }

    var order = undefined;
    if (req.query.order) {
      order = JSON.parse(req.query.order);
    }

    if (req.query.filter) {
      where = JSON.parse(req.query.filter);
      where = FilterParser.replacer(where);
    }

    var users = await User.findAndCountAll({
      limit,
      offset,
      order,
      where,
      col: `${User.name}.id`,
      distinct: true,
      subQuery: false,
    });

    users.rows = users.rows.map((e) => {
      e.password_hash = undefined;
      return e;
    });

    return res.status(200).json(users);
  }

  async find(req, res) {
    // #swagger.tags = ['User']
    // #swagger.security = [{ api_key: [] }]

    var id = req.params.user_id;

    if (!id) {
      id = req.user.id;
    }

    let user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user = user.toJSON();

    user.password_hash = undefined;
    user.follow_number = await UserFollow.count({
      where: {
        from_user_id: user.id,
      },
    });
    user.followed_number = await UserFollow.count({
      where: {
        to_user_id: user.id,
      },
    });

    return res.status(200).json(user);
  }

  async signIn(req, res) {
    // #swagger.tags = ['User']

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: {
              [Op.eq]: email,
            },
          },
          {
            code: {
              [Op.eq]: email,
            },
          },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Email e/ou senha inválidos' });
    }

    user.password = undefined;
    user.password_hash = undefined;

    const token = jwt.sign(
      {
        user: {
          id: user.id,
        },
      },
      process.env.JWT_SECRET,
      {}
    );

    let result = user.toJSON();
    result.token = token;
    result.follow_number = await UserFollow.count({
      where: {
        from_user_id: user.id,
      },
    });

    result.followed_number = await UserFollow.count({
      where: {
        to_user_id: user.id,
      },
    });

    if (req.query.admin == 'true') {
      result.user_type = undefined;
      result.follow_number = undefined;
      result.followed_number = undefined;

      result = { user: result };
      result.permissions = await getPermissions(result.user.id);
    }

    return res.status(200).json(result);
  }

  async update(req, res) {
    // #swagger.tags = ['User']
    // #swagger.security = [{ api_key: [] }]

    const schema = Yup.object().shape({
      first_name: Yup.string().notRequired(),
      last_name: Yup.string().notRequired(),
      cpf: Yup.string().notRequired(),
      rg: Yup.string().notRequired(),
      code: Yup.string().notRequired(),
      email: Yup.string().notRequired(),
      password: Yup.string().notRequired(),
      phone: Yup.string().notRequired(),
      user_type_id: Yup.number().notRequired(),
      privacy_policy_id: Yup.number().notRequired(),
      term_use_id: Yup.number().notRequired(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var user = await User.findByPk(req.params.user_id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const {
      first_name,
      last_name,
      cpf,
      rg,
      code,
      email,
      password,
      phone,
      user_type_id,
      store_id,
      address,
      image,
      privacy_policy_id,
      term_use_id,
    } = req.body;

    user = await user.update({
      first_name,
      last_name,
      cpf,
      rg,
      code,
      email,
      password,
      phone,
      privacyPolicyId: privacy_policy_id,
      termUseId: term_use_id,
      userTypeId: user_type_id,
      storeId: store_id,
      image,
    });

    if (image) {
      let newImage = await Image.create(image);

      await user.update({
        imageId: newImage.id,
      });
    }

    if (address) {
      var newAddress = await Address.findByPk(user.addressId);

      if (newAddress) {
        await newAddress.update(address);
      } else {
        newAddress = await Address.create(address);
      }

      await user.update({
        addressId: newAddress.id,
      });
    }

    user = await User.findByPk(user.id);
    user.password_hash = undefined;

    return res.status(200).json(user);
  }

  async userTypes(req, res) {
    // #swagger.tags = ['User']
    // #swagger.security = [{ api_key: [] }]

    if (!auth.check(req.user, ['admin'])) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    let user_types = await UserType.findAll();

    return res.status(200).json(user_types);
  }

  async destroy(req, res) {
    // #swagger.tags = ['User']
    // #swagger.security = [{ api_key: [] }]

    if (!auth.check(req.user, ['admin'])) {
      return res
        .status(401)
        .json({ message: 'Exclusão de usuário não autorizado' });
    }

    var user = await User.findOne({
      where: {
        id: {
          [Op.eq]: req.params.user_id,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await user.destroy();

    return res.status(200).json({ message: 'Usuário excluído' });
  }

  async bulkDestroy(req, res) {
    // #swagger.security = [{ api_key: [] }]

    const bulk = JSON.parse(req.query.bulk);

    await User.destroy({ where: { id: bulk } });

    return res.status(200).json({ message: 'Usuários excluídos' });
  }
}

async function getPermissions(userId) {
  let user_admins = await UserAdmin.scope('withoutData').findAll({
    where: {
      userId,
    },
  });

  let sql = (user_admin_permission_id, store_type_id) => `
    SELECT 
      user_admin_features.key 
    FROM user_admin_permission_features
    JOIN user_admin_features ON user_admin_features.id = user_admin_permission_features.user_admin_feature_id
    WHERE user_admin_permission_features.user_admin_permission_id = ${user_admin_permission_id}
    AND store_type_id = ${store_type_id}
    AND user_admin_permission_features.deleted_at IS NULL
    AND user_admin_features.deleted_at IS NULL;      
  `;

  let permissions = [];

  for (let i = 0; i < user_admins.length; i++) {
    let user_admin = user_admins[i].toJSON();

    console.log(user_admin);

    let permission = {
      key: user_admin.user_admin_permission.key,
      permission: user_admin.user_admin_permission.name,
      store_type: user_admin.store_place.store_type.key,
      store_type_name: user_admin.store_place.store_type.name,
      name: user_admin.store_place[user_admin.store_place.store_type.key].name,
      image:
        user_admin.store_place[user_admin.store_place.store_type.key].image,
    };

    const token = jwt.sign(
      {
        user: {
          id: userId,
        },
        store: {
          id: user_admin.store_place.id,
        },
      },
      process.env.JWT_SECRET,
      {}
    );

    permission.token = token;

    let [results] = await db.connection.query(
      sql(
        user_admin.user_admin_permission.id,
        user_admin.store_place.store_type.id
      )
    );

    results = results.map((e) => e.key);

    permission.features = results;

    permissions.push(permission);
  }

  const result = [
    ...permissions
      .reduce((hash, obj) => {
        let key = obj.key;

        const current = hash.get(key) || {
          key,
          name: obj.permission,
          stores: [],
        };

        obj.key = undefined;
        obj.permission = undefined;

        current.stores.push(obj);

        return hash.set(key, current);
      }, new Map())
      .values(),
  ];

  return result;
}

export default new UserController();