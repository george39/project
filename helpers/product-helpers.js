const { model } = require('mongoose');
const Product = model('Product');
const DataType = model('DataType');
const { asyncForEach } = require('./global-helpers');

/**
 * @param {object[]} productLangs
 * @param {string} langCode
 * @returns {object}
 */
exports.processLang = (productLangs, langCode = 'es') => {
  if (productLangs === null) return [];
  if (!Array.isArray(productLangs)) return productLangs;

  const filtred = productLangs.filter((item) => item.lang_id.languageCode === langCode);
  return filtred[0] || productLangs[0];
};

/**
 *
 * @param {Product} product
 * @param {ObjectId} listDiscountId
 * @param {Number} valueGlobalDisc
 * @description Shows product with its discount
 */
exports.applyDiscount = function (product, listDiscountId, valueGlobalDisc) {
  switch (product.typeDiscount.nameLang) {
    case 'global':
      var valueDiscount = Math.trunc(
        product.priceTaxIncluded - (product.priceTaxIncluded * valueGlobalDisc) / 100
      );

      product.discountPrice = Math.ceil(valueDiscount / 50) * 50;
      product.discountValue = valueGlobalDisc;
      break;
    case 'individual':
      product.discountPrice = product.localDiscount
        ? product.localDiscount.newPrice
        : product.priceTaxIncluded;

      if (product.localDiscount.typeDiscount) {
        if (product.localDiscount.typeDiscount.nameLang === 'percent') {
          product.discountValue = product.localDiscount.discountValue;
        } else {
          product.discountValue = Math.round(
            ((product.priceTaxIncluded - product.discountPrice) * 100) / product.priceTaxIncluded
          );
        }
      }
      break;
    case 'listPrice':
      var listPrice = product.discountList_id.filter((itemList) =>
        itemList._id.equals(listDiscountId)
      );
      // eslint-disable-next-line eqeqeq
      if (listPrice[0] && listPrice[0].newPrice != product.priceTaxIncluded) {
        product.discountPrice = listPrice[0].newPrice;
        if (listPrice[0].name === 'percent') {
          product.discountValue = listPrice[0].discountValue;
        } else {
          product.discountValue = Math.round(
            ((product.priceTaxIncluded - product.discountPrice) * 100) / product.priceTaxIncluded
          );
        }
      }
      break;
  }

  return product;
};

exports.applyLocalDiscount = ({ typeValueDiscount, product, discountValue, typeDiscount }) => {
  product.typeDiscount = typeDiscount;
  product.localDiscount = {
    typeDiscount: typeValueDiscount._id,
    discountValue: discountValue
  };

  const { priceTaxIncluded } = product;

  if (typeValueDiscount.nameLang === 'percent') {
    const newValue = Math.trunc(priceTaxIncluded - (priceTaxIncluded * discountValue) / 100);
    product.localDiscount.newPrice = Math.ceil(newValue / 50) * 50;
  } else {
    product.localDiscount.newPrice = priceTaxIncluded - discountValue;
  }

  return product;
};

exports.applyMassiveLocalDiscount = async (productsIds, discountMassive) => {
  const [products, individualDiscount, typeValueDiscount] = await Promise.all([
    Product.find({ _id: { $in: productsIds } }).exec(),
    DataType.findOne({ nameLang: 'individual' }).lean().exec(),
    DataType.findOne({ _id: discountMassive.typeValueDiscount }).lean().exec()
  ]);

  await asyncForEach(products, async (product) => {
    product = exports.applyLocalDiscount({
      product,
      typeDiscount: individualDiscount._id,
      typeValueDiscount: typeValueDiscount,
      discountValue: discountMassive.discountValue
    });

    await product.save();
  });
};
