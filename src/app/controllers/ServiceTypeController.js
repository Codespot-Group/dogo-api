import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import ServiceType from '../models/service_types';

class ServiceTypeController {
  async index(req, res) {
    var limit = req.query.limit
      ? (limit = parseInt(req.query.limit))
      : undefined;

    var offset = req.query.offset
      ? (offset = parseInt(req.query.offset))
      : undefined;

    var order = undefined;
    if (req.query.order) {
      order = JSON.parse(req.query.order);
    }

    var where = {};
    if (req.query.filter) {
      where = JSON.parse(req.query.filter);
      where = FilterParser.replacer(where);
    }

    var service_type = await ServiceType.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(service_type);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    let {
      name
    } = req.body;

    var includes = [];

    let service_type = await ServiceType.create(
      {
        name
      },
      {
        include: includes
      }
    );

    service_type = await ServiceType.findByPk(service_type.id);

    return res.status(200).json(service_type);
  }
} 
export default new ServiceTypeController();