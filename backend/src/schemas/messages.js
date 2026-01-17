const Joi = require('joi');

const messagesSchema = Joi.object({
  body: Joi.object({
    lead_id: Joi.number().integer().required(),
    message: Joi.string().min(1).required(),
    direction: Joi.string().valid('in', 'out').required(),
    agent: Joi.string().optional(),
    metadata: Joi.object().optional()
  })
});

module.exports = { messagesSchema };
