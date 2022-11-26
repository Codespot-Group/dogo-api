import Image from "../models/image";

class UserImageController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      image: Yup.object().shape({
        data: Yup.string().required(),
      }).required(),
    });

    try {
      await schema.validate(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.errors[0] });
    }

    let { name, image, description } = req.body;

    var includes = [];

    if (image) {
      includes.push(Image);
    }

    var user_image = await UserImage.create(
      {
        name,
        image,
        description,
      },
      { include: includes }
    );

    user_image = await UserImage.findByPk(user_image.id);

    return res.status(200).json(user_image);
  }

  async index(req, res) {

  }
}

export default new UserImageController();