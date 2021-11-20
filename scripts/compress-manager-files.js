const sharp = require('sharp');
const { unlinkSync } = require('fs');
const mongoose = require('mongoose');
const ManagerFile = require('../modules/manager-files/server/models/manager-file.server.model');
const { resolve } = require('path');
const { asyncForEach } = require('../helpers/global-helpers');
const chalk = require('chalk');

(async function () {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };

  const db = null;

  if (db === null) {
    console.log(chalk.red('Elija una base de datos'));
    return;
  }

  await mongoose
    .connect(`mongodb://localhost/${db}`, options)
    .then(function () {})
    .catch(function (err) {
      console.error('Could not connect to MongoDB!');
      console.log(err);
    });

  const managerFiles = await ManagerFile.find({ mimetype: { $ne: 'image/webp' } }).exec();

  if (!managerFiles || managerFiles.length === 0) {
    console.log(chalk.blue('Archivos actualizados: ', 0));
    return;
  }

  const destination = resolve(managerFiles[0].destination);
  const newPath = managerFiles[0].destination.substr(1, managerFiles[0].destination.length);

  console.log(destination);
  console.log(newPath);

  console.log(managerFiles.length);
  let count = 0;

  await asyncForEach(managerFiles, async (managerFile) => {
    const oldPath = managerFile.path;
    const newFileName = `${managerFile.filename}.webp`;

    await sharp(`${destination}/${managerFile.filename}`)
      .toFile(`${destination}/${newFileName}`)
      .then((res) => {
        managerFile.size = res.size;
        managerFile.filename = newFileName;
        managerFile.mimetype = 'image/webp';
        managerFile.path = newPath + newFileName;
      })
      .then(() => {
        unlinkSync(`.${oldPath}`);
        count++;
      })
      .catch((err) => {
        console.error(err);
      });

    console.log(chalk.green('Saving...'));
    await managerFile.save();
  });

  console.log(chalk.blue('Archivos actualizados: ', count));
})();
