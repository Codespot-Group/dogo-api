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

    let {
      name,
      email,
      password,
      image,
    } = req.body;

    var includes = [];

    if (image) {
      includes.push(Image);
    }

    user = await User.create(
      {
        name,
        email,
        password,
        image,
      },
      {
        include: includes,
      }
    );

    user = await User.findByPk(user.id);
    user.password_hash = undefined;

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

    var users = await User.findAll({
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


    return res.status(200).json(user);
  }

  async signIn(req, res) {
    

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

    return res.status(200).json(result);
  }

  async update(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string().notRequired(),
      email: Yup.string().notRequired(),
      password: Yup.string().notRequired(),
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
      name,
      email,
      password,
      image,
    } = req.body;

    user = await user.update({
      name,
      email,
      password,
      image,
    });

    if (image) {
      let newImage = await Image.create(image);

      await user.update({
        imageId: newImage.id,
      });
    }

    user = await User.findByPk(user.id);
    user.password_hash = undefined;

    return res.status(200).json(user);
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


export default new UserController();
