import { Schema, model, models } from "mongoose";

const citySchema = new Schema({
  id: {
    type: Number,
    default: 1,
  },
  code: {
    type: String,
  },
  title: {
    type: String,
  },
  lat: {
    type: String,
  },
  lng: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
});

const CityModel = models.cities || model("cities", citySchema);

export default CityModel
