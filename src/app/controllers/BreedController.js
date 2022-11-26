import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import Breed from '../models/breed';
import PetType from '../models/pet_type';

class BreedController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      pet_type: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { name, pet_type } = req.body;

    var includes = [];

    if (pet_type) {
      includes.push(PetType);
    }

    var breed = await Breed.create({
      name,
      pet_type,
    },
    {include:includes});

    breed = await Breed.findByPk(breed.id);

    return res.status(200).json(breed);
  }

  async find(req, res) {
    const id = req.params.breed_id;

    let breed = await Breed.findOne({
      where: {
        id,
      },
    });

    if (!breed) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrada' });
    }

    return res.status(200).json(breed);
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

    var breed = await Breed.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(breed);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notRequired(),
      pet_type: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var breed = await Breed.findByPk(req.params.breed_id);

    if (!breed) {
      return res
        .status(404)
        .json({ message: 'Pergunta frequente não encontrado' });
    }

    const { title, description } = req.body;

    breed = await breed.update({
      name,
      pet_type,
    });

    breed = await Breed.findByPk(breed.id);

    return res.status(200).json(breed);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    var breed = await Breed.findAll({ where: { id: bulk } });

    var successes = [];
    var errors = [];

    for (var i = 0; i < breed.length; i++) {
      var breed = breed[i];
      var messages = [];

      var data = {
        id: breed.id,
        name: breed.title,
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

    await Breed.destroy({ where: { id: ids } });

    return res.status(200).json({ errors, successes });
  }
}

export default new BreedController();
