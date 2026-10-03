import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE_SCREEN = 'Available'
export const CANCELLED_SCREEN = 'Cancelled'
export const FULL_SCREEN = 'Full'
export const statusScreen = [AVAILABLE_SCREEN, FULL_SCREEN, CANCELLED_SCREEN]
export const PROJECTOR_1 = 'Projector_1'
export const PROJECTOR_2 = 'Projector_2'
export const PROJECTOR_3 = 'Projector_3'
export const FORMAT_2D = '2D'
export const FORMAT_3D = '3D'
export const FORMAT_IMAX = 'IMAX'
export const FORMAT_4DX = '4DX'
export const FORMAT_SCREENX = 'ScreenX'
export const screenFormats = [FORMAT_2D, FORMAT_3D, FORMAT_IMAX, FORMAT_4DX, FORMAT_SCREENX]
export const projectors = [PROJECTOR_1, PROJECTOR_2, PROJECTOR_3]

const ScreenRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    NumberSeat: {
      type: Number,
      default: 20,
      enum: [56, 64, 72],
      required: true
    },
    format: {
      type: String,
      enum: screenFormats,
      default: FORMAT_2D
    },
    projector: {
      type: String,
      enum: projectors,
      required: true
    },
    CinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    ShowtimesId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtimes'
      }
    ],
    status: {
      type: String,
      enum: statusScreen,
      default: AVAILABLE_SCREEN
    },
    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
)

ScreenRoomSchema.plugin(mongoosePaginate)

export default mongoose.model('ScreeningRoom', ScreenRoomSchema)
