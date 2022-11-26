import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import Store from '../models/store';
import Address from '../models/address';
import Image from '../models/image';

class StoreController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().notRequired(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { name, description,image,address } = req.body;

    var includes = [];

    if (image) {
      includes.push(Image);
    }


    if (address) {
      includes.push(Address);
    }

    var store = await Store.create({
      name,
      description,
      image,
      address,
    },{include:includes});

    store = await Store.findByPk(store.id);

    return res.status(200).json(store);
  }

  async find(req, res) {
    const id = req.params.store_id;

    let store = await Store.findOne({
      where: {
        id,
      },
    });

    if (!store) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrada' });
    }

    return res.status(200).json(store);
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

    var stores = await Store.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(stores);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notRequired(),
      description: Yup.string().notRequired(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var store = await Store.findByPk(req.params.store_id);

    if (!store) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrado' });
    }

    const { title, description } = req.body;

    store = await store.update({
      name,
      description,
      image,
      address,
    });

    store = await Store.findByPk(store.id);

    return res.status(200).json(store);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    var stores = await Store.findAll({ where: { id: bulk } });

    var successes = [];
    var errors = [];

    for (var i = 0; i < stores.length; i++) {
      var store = stores[i];
      var messages = [];

      var data = {
        id: store.id,
        name: store.title,
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

    // for (var i in ids) {
    //   var store = await Store.findByPk(ids[i]);
    //   await store.update({
    //     deletedBy: req.user.id,
    //   });
    // }

    await Store.destroy({ where: { id: ids } });

    return res.status(200).json({ errors, successes });
  }
}

export default new StoreController();
