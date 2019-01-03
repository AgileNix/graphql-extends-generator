const Path = require('path');
const parse = require('./parse');
const merge = require('./merge');
const write = require('./write');
const { flatten } = require('./helpers');

const findExtendedName = (extendsPath) => {
  const formattedPath = Path.resolve(extendsPath);
  const pathArr = formattedPath.split(Path.sep);
  return pathArr[pathArr.length - 1].split('.')[0];
};

const processExtended = async ({ source, extendsPath, prefix, postfix, forbiddenDirectives }) => {
  const extended = await parse(extendsPath);
  const generated = merge(source, extended);
  const name = `${prefix}${findExtendedName(extendsPath)}${postfix}.graphql`;
  return write({ generated, path: extendsPath, name, forbiddenDirectives });
};

const generate = async (
  sourcePath = null,
  extendsPath = null,
  {
    prefix = '',
    postfix = 'Generated',
    forbiddenDirectives = [],
  } = {},
) => {
  const source = [];
  if (Array.isArray(sourcePath)) {
    const sources = await Promise.all(sourcePath.map(parse));
    source.push(...flatten(sources));
  } else {
    source.push(...await parse(sourcePath));
  }
  if (Array.isArray(extendsPath)) {
    await Promise.all(extendsPath.map(
      e => processExtended({ source, extendsPath: e, prefix, postfix, forbiddenDirectives }))
    );
  } else {
    await processExtended({ source, extendsPath, prefix, postfix, forbiddenDirectives });
  }
};

module.exports = generate;
