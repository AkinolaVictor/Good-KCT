const mongoose = require('mongoose')
// const { revertJson } = require('../utils/utilsExport')


const bubbleSchema = mongoose.Schema({
  user: {},
  type: String,
  createdDate: {},
  bubble: [],
  settings: {},
  reply:String,
  like:[],
  audience: [],
  totalImpressions: Number,
  aosID: Number,
  openedReplyCount: Number,
  followers: {},
  openedChartCount: Number,
  totalLikes: Number,
  openedReply: Number,
  activities: String,
  shareStructure: String,
  identity: Boolean,
  postID: String,
  version: Number,
  createdAt: {type: Date, default: new Date()},
  updatedAt: {
      type: Date,
      default: () => Date.now()
  }
}, {strict: false, minimize: false})
  
const bubble = mongoose.model("bubbles", bubbleSchema)

module.exports = bubble