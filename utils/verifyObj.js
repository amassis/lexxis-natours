module.exports = (obj, requiredFields) => {
  const missing = [];
  requiredFields.forEach((el) => {
    if (!obj[el]) missing.push(el);
  });
  return missing;
};
