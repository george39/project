const { model } = require('mongoose');
const Follow = model('Follow');
const User = model('User');

exports.follow = async (req, res) => {
  const followee = req.params.userId;
  const follower = req.user._id;

  try {
    const followeeExists = await User.findOne({ _id: followee }).lean().exec();

    if (!followeeExists) {
      return res
        .status(422)
        .json({ message: 'El usuario al que estás tratando de seguir ya no existe' });
    }

    const isAlreadyFollowed = await Follow.findOne({ follower, followee }).lean().exec();

    if (isAlreadyFollowed) {
      return res.status(422).json({ message: 'Ya sigues a este usuario' });
    }

    const follow = new Follow({
      follower,
      followee
    });

    await follow.save();
    await Promise.all([
      User.update({ _id: follower }, { $inc: { following: 1 } }),
      User.update({ _id: followee }, { $inc: { followers: 1 } })
    ]);

    return res.status(200).json({ message: 'Usuario seguido' });
  } catch (e) {
    console.error(e);
    return res.status(422).json({ message: e });
  }
};

exports.getOne = async (req, res) => {
  const follower = req.user._id;
  const followee = req.params.userId;

  try {
    const follow = await Follow.findOne({ followee, follower }).lean().exec();
    return res.status(200).json({ data: follow });
  } catch (e) {
    console.error(e);
    return res.status(422).json({ message: 'Ha ocurrido un error al obtener follow' });
  }
};

exports.unfollow = async (req, res) => {
  const followee = req.params.userId;
  const follower = req.user._id;

  try {
    const isAlreadyFollowed = await Follow.findOne({ follower, followee }).lean().exec();

    if (!isAlreadyFollowed) {
      return res.status(422).json({ message: 'No sigues a este usuario' });
    }

    await Follow.remove({
      follower,
      followee
    });

    await Promise.all([
      User.update({ _id: follower }, { $inc: { following: -1 } }),
      User.update({ _id: followee }, { $inc: { followers: -1 } })
    ]);

    return res.status(200).json({ message: 'Dejaste de seguir a este usuario' });
  } catch (e) {
    console.error(e);
    return res.status(422).json({ message: e });
  }
};

