const Joi = require('joi');

const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().max(255).optional(),
    role: Joi.string().valid('user', 'admin').optional()
  })
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
});

module.exports = { registerSchema, loginSchema };
