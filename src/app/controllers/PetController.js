import FilterParser from '../services/FilterParser';
import * as Yup from 'yup';
import Pet from '../models/pet';
import Breed from '../models/breed';
import Image from '../models/image';

class PetController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
      breed: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
      user: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    const { name, image, breed, user_id } = req.body;

    var includes = [];

    if (image) {
      includes.push(Image);
    }
    if (breed) {
      includes.push(Breed);
    }

    var pet = await Pet.create(
      {
        name,
        image,
        breed,
        userId: user_id,
      },
      { include: includes }
    );

    pet = await Pet.findByPk(pet.id);

    return res.status(200).json(pet);
  }

  async find(req, res) {
    const id = req.params.pet_id;

    let pet = await Pet.findOne({
      where: {
        id,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrada' });
    }

    return res.status(200).json(pet);
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

    var pets = await Pet.findAll({
      limit,
      offset,
      order,
      where,
      subQuery: false,
    });

    return res.status(200).json(pets);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      image: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
      breed: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
      user: Yup.object().shape({
        data: Yup.string().notRequired(),
      }),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    var pet = await Pet.findByPk(req.params.pet_id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }

    const { name } = req.body;

    pet = await pet.update({
      name,
      breed,
      image,
      user,
    });

    pet = await Pet.findByPk(pet.id);

    return res.status(200).json(pet);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    var pets = await Pet.findAll({ where: { id: bulk } });

    var successes = [];
    var errors = [];

    for (var i = 0; i < pets.length; i++) {
      var pet = pets[i];
      var messages = [];

      var data = {
        id: pet.id,
        name: pet.title,
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

    await Pet.destroy({ where: { id: ids } });

    return res.status(200).json({ errors, successes });
  }
  async destroy(req, res) {
    const id = req.params.pet_id;

    var pet = await Pet.findByPk(id);

    if (!pet) {
      return res.status(404).json({ message: 'pet não encontrado' });
    }

    await pet.destroy();

    return res.status(200).json({ message: 'pet deletado' });
  }

  async getPetById(req, res) {
    const id = req.params.pet_id;

    var pet = await Pet.findByPk(id);

    if (!pet) {
      return res.status(404).json({ message: 'pet não encontrado' });
    }

    return res.status(200).json(pet);
  }
}

export default new PetController();
