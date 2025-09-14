import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentScehma  = new mongoose.Schema(
    {
        content:{
            type: String,
            required: true
        },
        video:{
            ype: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            ype: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true}
)

commentScehma.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment",commentScehma);