import Joi from 'joi'

const CinemaSchema = Joi.object({
  name: Joi.string().min(1).trim(),
  CinemaName: Joi.string().min(1).trim(),
  address: Joi.string().allow(''),
  CinemaAdress: Joi.string().allow(''),
  city: Joi.string().allow(''),
  amenities: Joi.array().items(Joi.string()),
  hotline: Joi.string().allow(''),
  imageUrl: Joi.string().allow(''),
  badge: Joi.string().allow(''),
  ScreeningRoomId: Joi.array()
    .items(Joi.string().allow(''))
    .empty(Joi.array().length(0))
})
  .or('name', 'CinemaName')
  .or('address', 'CinemaAdress')
  .options({
    abortEarly: false
  })

export default CinemaSchema
