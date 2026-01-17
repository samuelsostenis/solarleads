const Joi = require('joi');

const campaignSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().allow('', null).optional(),
    target_audience: Joi.string().optional(),
    message_template: Joi.string().min(1).required(),
    status: Joi.string().valid('draft', 'active', 'paused', 'archived').optional()
  })
});

module.exports = { campaignSchema };
