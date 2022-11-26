import { Op } from 'sequelize';
import Address from '../models/address';

class AddressController {
  async find(req, res) {
    const id = req.params.address_id;

    let address = await Address.findOne({
      where: {
        id,
      },
    });

    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado' });
    }

    return res.status(200).json(address);
  }

  async bulkDestroy(req, res) {
    const bulk = JSON.parse(req.query.bulk);

    await Address.destroy({ where: { id: bulk } });

    return res.status(200).json({ message: 'Exclusão em massa concluída' });
  }

  async update(req, res) {
    var address = await Address.findByPk(req.params.address_id);

    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado' });
    }

    address = await address.update(req.body);

    address = await Address.findByPk(address.id);

    return res.status(200).json(address);
  }

  async destroy(req, res) {
    var address = await Address.findOne({
      where: {
        id: {
          [Op.eq]: req.params.address_id,
        },
      },
    });

    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado' });
    }

    await address.destroy();

    return res.status(200).json({ message: 'Endereço excluído' });
  }
}

export default new AddressController();
