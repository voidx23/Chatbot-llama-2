import mongoose from "mongoose";


async function connectDb() {
   try {
       await mongoose.connect(process.env.MONGO_URI, {

      }).then(console.log("connected"))
   } catch (error) {
      console.log(error)

   }

}

export default connectDb


