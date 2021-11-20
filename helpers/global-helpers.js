exports.asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.generateRandomString = (length) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const RANK = alphabet.length - 1;
  let string = '';

  for (var i = 0; i < length; i++) {
    const index = Math.round(Math.random() * RANK);
    string += alphabet[index];
  }

  return string;
};
