const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  // Make sure the length of the id is 24
  // Check if the id is valid
  if (id.length === 24 && mongoose.isValidObjectId(id)) {
    // Invalid object ids change when converted to ObjectId at different times
    // But valid object ids do not change regardless of the times
    // So create an objectId using the value from the parameter
    const objectIdFromParam = new mongoose.Types.ObjectId(id);

    // Check if the parameter is the same as the objectId that was just created
    // It has to be converted to string first, otherwise it will always return false
    return objectIdFromParam.toString() === id;
  }

  return false;
};
module.exports = { isValidObjectId };
