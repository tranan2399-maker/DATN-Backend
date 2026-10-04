import mongoosePaginate from 'mongoose-paginate-v2'
import mongoose from 'mongoose'

const CinemaSchema = new mongoose.Schema(
  {
    // Chuẩn hóa tên rạp (Standardized Name)
    name: {
      type: String
    },
    // Trường cũ tương thích ngược (Legacy Compatibility)
    CinemaName: {
      type: String
    },

    // Chuẩn hóa địa chỉ (Standardized Address)
    address: {
      type: String
    },
    // Trường cũ tương thích ngược (Legacy Compatibility)
    CinemaAdress: {
      type: String
    },

    city: {
      type: String,
      default: 'Đà Nẵng'
    },
    amenities: {
      type: [String],
      default: []
    },
    hotline: {
      type: String,
      default: '1900 1234'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: 'Standard'
    },
    ScreeningRoomId: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ScreeningRoom'
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (!ret.name && ret.CinemaName) ret.name = ret.CinemaName
        if (!ret.CinemaName && ret.name) ret.CinemaName = ret.name
        if (!ret.address && ret.CinemaAdress) ret.address = ret.CinemaAdress
        if (!ret.CinemaAdress && ret.address) ret.CinemaAdress = ret.address
        return ret
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        if (!ret.name && ret.CinemaName) ret.name = ret.CinemaName
        if (!ret.CinemaName && ret.name) ret.CinemaName = ret.name
        if (!ret.address && ret.CinemaAdress) ret.address = ret.CinemaAdress
        if (!ret.CinemaAdress && ret.address) ret.CinemaAdress = ret.address
        return ret
      }
    }
  }
)

// Tự động đồng bộ hai chiều trước khi validate & save
CinemaSchema.pre('validate', function (next) {
  if (this.name && !this.CinemaName) this.CinemaName = this.name
  if (this.CinemaName && !this.name) this.name = this.CinemaName
  if (this.address && !this.CinemaAdress) this.CinemaAdress = this.address
  if (this.CinemaAdress && !this.address) this.address = this.CinemaAdress
  next()
})

CinemaSchema.pre('save', function (next) {
  if (this.name && !this.CinemaName) this.CinemaName = this.name
  if (this.CinemaName && !this.name) this.name = this.CinemaName
  if (this.address && !this.CinemaAdress) this.CinemaAdress = this.address
  if (this.CinemaAdress && !this.address) this.address = this.CinemaAdress
  next()
})

// Tự động đồng bộ hai chiều khi dùng findOneAndUpdate / findByIdAndUpdate
CinemaSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update) {
    if (update.name && !update.CinemaName) update.CinemaName = update.name
    if (update.CinemaName && !update.name) update.name = update.CinemaName
    if (update.address && !update.CinemaAdress) update.CinemaAdress = update.address
    if (update.CinemaAdress && !update.address) update.address = update.CinemaAdress
    if (update.$set) {
      if (update.$set.name && !update.$set.CinemaName) update.$set.CinemaName = update.$set.name
      if (update.$set.CinemaName && !update.$set.name) update.$set.name = update.$set.CinemaName
      if (update.$set.address && !update.$set.CinemaAdress) update.$set.CinemaAdress = update.$set.address
      if (update.$set.CinemaAdress && !update.$set.address) update.$set.address = update.$set.CinemaAdress
    }
  }
  next()
})

// Virtual getters để đọc linh hoạt
CinemaSchema.virtual('cinemaName').get(function () {
  return this.name || this.CinemaName
})
CinemaSchema.virtual('cinemaAddress').get(function () {
  return this.address || this.CinemaAdress
})

CinemaSchema.plugin(mongoosePaginate)

export default mongoose.model('Cinema', CinemaSchema)
