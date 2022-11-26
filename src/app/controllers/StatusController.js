import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import Status from '../models/status';

class StatusController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required()
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { name } = req.body;

    var includes = [];

    var status = await Status.create({
      name
    },
    {include:includes});

    status = await Status.findByPk(status.id);

    return res.status(200).json(status);
  }

  async find(req, res) {
    const id = req.params.status_id;

    let status = await Status.findOne({
      where: {
        id,
      },
    });

    if (!status) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrada' });
    }

    return res.status(200).json(status);
  }

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

    var status = await Status.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(status);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notRequired()
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var status = await Status.findByPk(req.params.status_id);

    if (!status) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrado' });
    }

    const { title, description } = req.body;

    status = await status.update({
      name
    });

    status = await Status.findByPk(status.id);

    return res.status(200).json(status);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    var status = await Status.findAll({ where: { id: bulk } });

    var successes = [];
    var errors = [];

    for (var i = 0; i < status.length; i++) {
      var status = status[i];
      var messages = [];

      var data = {
        id: status.id,
        name: status.title,
        messages,
      };

      if (messages.length > 0) {
        errors.push(data);
      } else {
        successes.push(data);
      }
    }

    var ids = successes.map((e) => {
      return e.id;
    });

    await Status.destroy({ where: { id: ids } });

    return res.status(200).json({ errors, successes });
  }
}

export default new StatusController();
