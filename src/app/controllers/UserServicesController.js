import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import UserServices from '../models/user_services';
import auth from '../middlewares/auth';
import Service from '../models/service';
import Pet from '../models/pet';

class UserServicesController {
  async store(req, res) {
    const schema = Yup.object().shape({
      service_id: Yup.number().required(),
      pet_id: Yup.number().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    let { service_id, pet_id } = req.body;

    let service = await Service.findByPk(service_id);

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    let pet = await Pet.findByPk(pet_id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }

    let user_services = await UserServices.create({
      serviceId: service_id,
      petId: pet_id,
      statusId: 1,
      price: service.price,
      userId: pet.user.id,
    });

    user_services = await UserServices.findByPk(user_services.id);

    return res.status(200).json(user_services);
  }

  async index(req, res) {
    // #swagger.tags = ['UserServices']

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

    var user_servicess = await UserServices.findAll({
      limit,
      offset,
      order,
      where,
      col: `${UserServices.name}.id`,
      distinct: true,
      subQuery: false,
    });

    return res.status(200).json(user_servicess);
  }

  async find(req, res) {
    var id = req.params.user_services_id;

    if (!id) {
      id = req.user_services.id;
    }

    let user_services = await UserServices.findByPk(id);

    if (!user_services) {
      return res
        .status(404)
        .json({ message: 'Serviço de usuario não encontrado' });
    }

    user_services = user_services.toJSON();

    return res.status(200).json(user_services);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      price: Yup.string().required(),
      service: Yup.object().required(),
      status: Yup.object().required(),
      user: Yup.object().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var user_services = await UserServices.findByPk(
      req.params.user_services_id
    );

    if (!user_services) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const { price, service, status, user } = req.body;

    user_services = await user_services.update({
      price,
      service,
      status,
      user,
    });

    user_services = await UserServices.findByPk(user_services.id);

    return res.status(200).json(user_services);
  }

  async destroy(req, res) {
    if (!auth.check(req.user_services, ['admin'])) {
      return res
        .status(401)
        .json({ message: 'Exclusão de serviço não autorizado' });
    }

    var user_services = await UserServices.findOne({
      where: {
        id: {
          [Op.eq]: req.params.user_services_id,
        },
      },
    });

    if (!user_services) {
      return res
        .status(404)
        .json({ message: 'Serviço de usuário não encontrado' });
    }

    await user_services.destroy();

    return res.status(200).json({ message: 'Serviço de usuário excluído' });
  }

  async bulkDestroy(req, res) {
    // #swagger.security = [{ api_key: [] }]

    const bulk = JSON.parse(req.query.bulk);

    await UserServices.destroy({ where: { id: bulk } });

    return res.status(200).json({ message: 'Serviços de usuário excluídos' });
  }
}

export default new UserServicesController();
