const fs = require('fs');

const findAllIndexesOf = (source, match) => {
  const result = [];
  for (let i = 0; ;i += 1) {
    i = source.indexOf(match, i);
    if (i === -1) break;
    result.push(i);
  }
  return result;
};

const findTypeName = (source, typeIndex, openIndex) => {
  const name = source.substring(typeIndex, openIndex + 1).split(' ')[1];
  if (name.indexOf('<') !== -1) {
    return name.substring(0, name.indexOf('<'));
  }
  return name;
};

const findExtended = (source, typeIndex, openIndex) => {
  const extendedName = source.substring(typeIndex, openIndex).split(' ')[3];
  if (extendedName && extendedName.indexOf('<') !== -1) {
    return extendedName.substring(0, extendedName.indexOf('<'));
  }
  return extendedName;
};

const findGenericName = (source, typeIndex, openIndex) => {
  const name = source.substring(typeIndex, openIndex).split(' ')[1];
  const genericName = name.substring(name.indexOf('<') + 1, name.indexOf('>'));
  return genericName && genericName.length ? genericName : undefined;
};

const findGenericType = (source, typeIndex, openIndex) => {
  const extendedName = source.substring(typeIndex, openIndex).split(' ')[3];
  const genericType = extendedName && extendedName.substring(extendedName.indexOf('<') + 1, extendedName.indexOf('>'));
  return genericType && genericType.length ? genericType : undefined;
};

const handleLineBreaksBeforeDirectives = (source) => {
  const result = [];
  source.forEach((line) => {
    if (line.startsWith('@')) {
      result[result.length - 1] += ` ${line}`;
    } else {
      result.push(line);
    }
  });
  return result;
};

const convertToField = (line) => {
  const twoDotsIndex = line.indexOf(':');
  const directiveIndexes = findAllIndexesOf(line, '@');
  const lineHasDirectives = directiveIndexes.length;
  const name = line.substring(0, twoDotsIndex).trim();
  const type = line.substring(twoDotsIndex + 1, lineHasDirectives ? line.indexOf('@') : line.length)
    .replace(/,/, '')
    .trim();
  const directives = directiveIndexes.map((d, i, arr) => {
    const lastDirectiveIndex = arr.length - 1;
    if (lastDirectiveIndex === i) {
      return line.substring(d, line.length).trim();
    }
    return line.substring(d, arr[i + 1]).trim();
  });
  return { name, type, directives };
};

const findFields = (source, { openTypeIndex, closeTypeIndex }) => {
  const parsedStrings = source.substring(openTypeIndex + 1, closeTypeIndex - 1)
    .split('\n')
    .map(e => e.trim())
    .filter(e => e.length);

  const handledStrings = handleLineBreaksBeforeDirectives(parsedStrings);
  return handledStrings.map(convertToField);
};

const parseTypes = async path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return reject(err);
    }
    const typeIndexes = findAllIndexesOf(data, 'type ');
    const parsed = typeIndexes.map((_, i) => {
      const openTypeIndex = data.indexOf('{', typeIndexes[i]);
      const closeTypeIndex = data.indexOf('}', typeIndexes[i]);
      return {
        name: findTypeName(data, typeIndexes[i], openTypeIndex),
        type: 'type',
        extends: findExtended(data, typeIndexes[i], openTypeIndex),
        typeIndex: typeIndexes[i],
        openTypeIndex,
        closeTypeIndex,
        genericName: findGenericName(data, typeIndexes[i], openTypeIndex),
        genericType: findGenericType(data, typeIndexes[i], openTypeIndex),
      };
    });

    return resolve(parsed.map(e => ({ ...e, fields: findFields(data, e) })));
  });
});

const parseInputs = async path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return reject(err);
    }
    const typeIndexes = findAllIndexesOf(data, 'input ');
    const parsed = typeIndexes.map((_, i) => {
      const openTypeIndex = data.indexOf('{', typeIndexes[i]);
      const closeTypeIndex = data.indexOf('}', typeIndexes[i]);
      return {
        name: findTypeName(data, typeIndexes[i], openTypeIndex),
        type: 'input',
        extends: findExtended(data, typeIndexes[i], openTypeIndex),
        typeIndex: typeIndexes[i],
        openTypeIndex,
        closeTypeIndex,
        genericName: findGenericName(data, typeIndexes[i], openTypeIndex),
        genericType: findGenericType(data, typeIndexes[i], openTypeIndex),
      };
    });

    return resolve(parsed.map(e => ({ ...e, fields: findFields(data, e) })));
  });
});

const parseEnums = async path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return reject(err);
    }
    const typeIndexes = findAllIndexesOf(data, 'enum ');
    const parsed = typeIndexes.map((_, i) => {
      const openTypeIndex = data.indexOf('{', typeIndexes[i]);
      const closeTypeIndex = data.indexOf('}', typeIndexes[i]);
      return {
        name: findTypeName(data, typeIndexes[i], openTypeIndex),
        type: 'enum',
        extends: findExtended(data, typeIndexes[i], openTypeIndex),
        typeIndex: typeIndexes[i],
        openTypeIndex,
        closeTypeIndex,
        genericName: findGenericName(data, typeIndexes[i], openTypeIndex),
        genericType: findGenericType(data, typeIndexes[i], openTypeIndex),
      };
    });

    return resolve(parsed.map(e => ({ ...e, fields: findFields(data, e) })));
  });
});

const parse = async (path) => {
  const types = await parseTypes(path);
  const enums = await parseEnums(path);
  const inputs = await parseInputs(path);
  return [...types, ...enums, ...inputs];
};

module.exports = parse;
