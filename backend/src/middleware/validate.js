const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const toValidate = {};
    if (req.body && Object.keys(req.body).length) toValidate.body = req.body;
    if (req.params && Object.keys(req.params).length) toValidate.params = req.params;
    if (req.query && Object.keys(req.query).length) toValidate.query = req.query;

    const { error } = schema.validate(toValidate, { abortEarly: false, allowUnknown: false });
    if (error) {
      const details = error.details.map((d) => ({ message: d.message, path: d.path }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    next();
  };
}

module.exports = validate;
