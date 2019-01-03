const flatten = (args) => {
  const flattened = [];
  args.forEach((e) => {
    if (Array.isArray(e)) {
      flattened.push(...e);
    } else {
      flattened.push(e);
    }
  });
  return flattened;
};

const uniq = (args, by) => Object.values(
  args.reduce((res, val) => ({
    ...res,
    [val[by]]: val,
  }), Object.create(null)),
);

module.exports = {
  uniq, flatten,
};
