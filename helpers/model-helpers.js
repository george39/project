const { Types, model } = require('mongoose');
const moment = require('moment');

exports.processFilter = (filter = {}) => {
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter);
    } catch (e) {
      return {};
    }
  }

  if (Object.keys(filter).length === 0) return {};

  const isObjectId = /^[0-9a-fA-F]{24}$/;

  for (const field in filter) {
    if (!Object.prototype.hasOwnProperty.call(filter, field)) continue;

    if (Array.isArray(filter[field])) {
      for (let i = 0; i < filter[field].length; i++) {
        for (const key in filter[field][i]) {
          if (!Object.prototype.hasOwnProperty.call(filter[field][i], key)) continue;

          // TODO: Mejorar funcionalidad para filtrar $or y $and
          if (isObjectId.test(filter[field][i][key])) {
            filter[field][i][key] = Types.ObjectId(filter[field][i][key]);
          }
        }
      }
    }

    if (filter[field].begin && filter[field].end) {
      const begin = moment(filter[field].begin, 'YYYY-MM-DD H:mm:ss');
      const end = moment(filter[field].end, 'YYYY-MM-DD H:mm:ss');

      filter[field] = { $gte: begin.toDate(), $lte: end.toDate() };
    }

    // Validate if is ObjectId
    if (isObjectId.test(filter[field])) {
      filter[field] = Types.ObjectId(filter[field]);
    }
  }

  return filter;
};

exports.processPopulate = (populate = { path: '', select: '' }) => {
  if (typeof populate === 'string') {
    try {
      return JSON.parse(populate);
    } catch (e) {
      return { path: '', select: '' };
    }
  }

  return populate;
};

exports.processSort = (sort = { modified: -1 }) => {
  if (typeof sort === 'string') {
    try {
      return JSON.parse(sort);
    } catch (e) {
      return { modified: -1 };
    }
  }

  return sort;
};

