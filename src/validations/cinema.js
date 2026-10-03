import Joi from 'joi'

const CinemaSchema = Joi.object({
  CinemaName: Joi.string().required().min(1).trim().strict(),
  CinemaAdress: Joi.string().required(),
  city: Joi.string().allow(''),
  amenities: Joi.array().items(Joi.string()),
  hotline: Joi.string().allow(''),
  // ScreeningRoomId: Joi.array().items(Joi.string())
  ScreeningRoomId: Joi.array()
    .items(Joi.string().allow(''))
    .empty(Joi.array().length(0))
}).options({
  abortEarly: false
})
export default CinemaSchema
