module.exports = (obj, excludedFields) => {
  const newObj = {};
  const ignored = [];
  Object.keys(obj).forEach((el) => {
    if (!excludedFields.includes(el)) {
      newObj[el] = obj[el];
    } else {
      ignored.push(el);
    }
  });
  newObj.ignored = ignored;
  return newObj;
};
