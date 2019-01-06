const filter = (data) => data.map(e => ({
  ...e,
  fields: e.fields.filter(f => f.type !== '-')
}));

module.exports = filter;
