const { processLang } = require('./product-helpers');
const { model } = require('mongoose');
const DataType = model('DataType');
const Product = model('Product');

function filterProductsAsObjects(products, productsToCompare, lang) {
  const localProductsInCommon = products.filter((localProduct) =>
    productsToCompare.includes(localProduct._id.toString())
  );

  if (localProductsInCommon && localProductsInCommon.length > 0) {
    for (let i = 0; i < localProductsInCommon.length; i++) {
      localProductsInCommon[i].productLang = processLang(
        localProductsInCommon[i].productLang,
        lang
      );
    }

    return localProductsInCommon;
  }

  return false;
}

exports.findAllProductsInCommon = (products, massiveDiscounts, lang) => {
  const productsInCommon = [];
  const productsIds = [];

  for (let i = 0; i < massiveDiscounts.length; i++) {
    const commonProducts = filterProductsAsObjects(massiveDiscounts[i].products, products, lang);

    if (commonProducts) {
      productsInCommon.push({
        massiveDiscountId: massiveDiscounts[i]._id,
        massiveDiscountName: massiveDiscounts[i].name,
        products: commonProducts
      });

      const commonProductsInString = commonProducts.map((commonProduct) =>
        commonProduct._id.toString()
      );

      productsIds.push(...commonProductsInString);
    }
  }

  if (productsInCommon.length > 0 && productsIds.length > 0) {
    return {
      productsInCommon,
      productsIds
    };
  }

  return false;
};

exports.removeDiscount = async (productsIds) => {
  const noneDiscount = await DataType.findOne({ nameLang: 'none' }).lean().exec();
  await Product.updateMany(
    { _id: { $in: productsIds } },
    { $set: { typeDiscount: noneDiscount._id } }
  ).exec();
};
