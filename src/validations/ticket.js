import Joi from 'joi'

const ticketValidateSchema = Joi.object({
  priceId: Joi.alternatives().try(
    Joi.string(),
    Joi.object({
      _id: Joi.string().required(),
      price: Joi.number().optional()
    }).unknown(true)
  ).required(),
  typeBank: Joi.string().allow('', null),
  typePayment: Joi.string().allow('', null),
  amount: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  seatId: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.string(),
        Joi.object({
          _id: Joi.string().required(),
          typeSeat: Joi.string().optional(),
          price: Joi.number().optional(),
          row: Joi.number().optional(),
          column: Joi.number().optional()
        }).unknown(true)
      )
    )
    .required()
    .label('ghế')
    .min(1)
    .messages({
      'array.min': 'Phải chọn ít nhất 1 {{#label}}'
    }),
  userId: Joi.string().allow('', null),
  totalFood: Joi.number().optional(),
  movieId: Joi.alternatives().try(
    Joi.string(),
    Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().optional(),
      categoryId: Joi.array().optional(),
      image: Joi.string().optional()
    }).unknown(true)
  ).optional(),
  screenRoomId: Joi.alternatives().try(
    Joi.string(),
    Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().optional()
    }).unknown(true)
  ).optional(),
  cinemaId: Joi.alternatives().try(
    Joi.string(),
    Joi.object().unknown(true)
  ).optional(),
  paymentId: Joi.string().allow('', null),
  foods: Joi.array().items(
    Joi.object({
      foodId: Joi.string().optional(),
      name: Joi.string().optional(),
      price: Joi.number().optional(),
      quantity: Joi.number().optional(),
      quantityFood: Joi.number().optional()
    }).unknown(true)
  ).optional(),
  showtimeId: Joi.alternatives().try(
    Joi.string(),
    Joi.object({
      _id: Joi.string().required(),
      timeFrom: Joi.any().optional(),
      timeTo: Joi.any().optional()
    }).unknown(true)
  ).required(),
  quantity: Joi.number().min(1).max(20).optional(),
  totalPrice: Joi.number().optional()
}).options({
  abortEarly: false,
  allowUnknown: true
})

export default ticketValidateSchema
