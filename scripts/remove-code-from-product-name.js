const mongoose = require('mongoose');
const Product = require('../modules/products/server/models/product.server.model');
const { asyncForEach } = require('../helpers/global-helpers');
const chalk = require('chalk');

(async function () {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };

  const db = 'sport-shop-dev';

  if (db === null) {
    console.log(chalk.red('Elija una base de datos'));
    return;
  }

  await mongoose
    .connect(`mongodb://localhost/${db}`, options)
    .then(function () {})
    .catch(function (err) {
      console.error('Could not connect to MongoDB!');
      console.error(err);
    });

  const products = await Product.find({}).exec();

  let count = 1;

  await asyncForEach(products, async (product) => {
    const result = removeCodeFromProductLang(product.productLang);
    if (result.match) {
      product.productLang = result.data;
      await product.save();
      console.log(chalk.green('Actualizando registro #', count++));
    }
  });

  console.log(chalk.blue('Archivos actualizados: ', count - 1));

  /**
   * @param {object[]} productLangs
   */
  function removeCodeFromProductLang(productLangs) {
    let match = false;

    const newProductLangs = productLangs.map((lang) => {
      let name = lang.name;
      let indexCode = name.indexOf('COD.');
      const indexCode2 = name.indexOf('cod.');

      if (indexCode > 0 || indexCode2 > 0) {
        indexCode = indexCode2 > 0 ? indexCode2 : indexCode;
        match = true;

        let newName = name.substr(0, indexCode - 1);

        if (newName[newName.length - 1] === '-' || newName[newName.length - 1] === ' ') {
          newName = newName.substr(0, newName.length - 1);
        }

        console.log('Old Name: ', name);
        console.log('New Name: ', newName);
        console.log('------------------------');

        name = newName;
      }

      return {
        _id: lang._id,
        lang_id: lang.lang_id,
        name,
        description: lang.description
      };
    });

    return {
      match,
      data: newProductLangs
    };
  }
})();

