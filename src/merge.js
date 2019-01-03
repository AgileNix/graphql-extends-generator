const { flatten, uniq } = require('./helpers');

const merge = (...args) => {
  const data = uniq(flatten(args), 'name');
  return data
    .filter(e => e.extends)
    .map((e) => {
      const found = data.find(x => x.name === e.extends);
      if (!found) {
        return null;
      }
      return {
        ...e,
        genericName: found.genericName,
        fields: uniq(found.fields.concat(e.fields), e.type === 'enum' ? 'type' : 'name'),
      };
    })
    .filter(e => e);
};

module.exports = merge;
