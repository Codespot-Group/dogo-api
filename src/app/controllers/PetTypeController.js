import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import PetType from '../models/pet_type';
import Image from '../models/image';

class PetTypeController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { name, image } = req.body;

    var includes = [];

    if (image) {
      includes.push(Image);
    }

    var petType = await PetType.create({
      name,
      image,
    },
    {include:includes});

    petType = await PetType.findByPk(petType.id);

    return res.status(200).json(petType);
  }

  async find(req, res) {
    const id = req.params.pet_type_id;

    let petType = await PetType.findOne({
      where: {
        id,
      },
    });

    if (!petType) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrada' });
    }

    return res.status(200).json(petType);
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

    var petTypes = await PetType.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(petTypes);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notRequired(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var petType = await PetType.findByPk(req.params.petType_id);

    if (!petType) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrado' });
    }

    const { title, description } = req.body;

    petType = await petType.update({
      name,
      image,
    });

    petType = await PetType.findByPk(petType.id);

    return res.status(200).json(petType);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    var petTypes = await PetType.findAll({ where: { id: bulk } });

    var successes = [];
    var errors = [];

    for (var i = 0; i < petTypes.length; i++) {
      var petType = petTypes[i];
      var messages = [];

      var data = {
        id: petType.id,
        name: petType.title,
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

    await PetType.destroy({ where: { id: ids } });

    return res.status(200).json({ errors, successes });
  }
}

export default new PetTypeController();
