const Path = require('path');
const fs = require('fs');

const buildPath = (path, name) => Path.resolve(path, '..', name);

const objToStr = (o, forbiddenDirectives) => {
  const str = `${o.fields.reduce((res, field) => {
    if (o.type === 'enum') {
      return `${res}\n ${field.type}`;
    }
    if (!field.nameWithParams.length) {
      return res;
    }
    return `${res}\n  ${field.nameWithParams}: ${field.type}${field.directives.reduce((r, d) => {
      if (forbiddenDirectives.find(fd => d.indexOf(fd) !== -1)) {
        return r;
      }
      return `${r} ${d}`;
    }, ' ')}`;
  }, `${o.type} ${o.name} {`)}\n}`;
  if (o.genericName && o.genericType) {
    return str.replace(o.genericName, o.genericType);
  }
  return str;
};

const parse = async ({ generated, path, name, forbiddenDirectives }) => new Promise((resolve, reject) => {
  const data = generated.reduce((res, val) => `${res}${objToStr(val, forbiddenDirectives)}\n\n`, '');
  fs.writeFile(buildPath(path, name), data, 'utf8', (err) => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

module.exports = parse;
