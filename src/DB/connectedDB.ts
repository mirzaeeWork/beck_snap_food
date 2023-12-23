import mongoose from "mongoose"

const connectedDB=async  ()=> {
  await mongoose.connect("mongodb://127.0.0.1:27017/back-snap-food");
  console.log('connected to DB');
}

export {connectedDB}
