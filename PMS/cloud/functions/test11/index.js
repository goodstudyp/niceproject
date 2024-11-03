exports.main = async (event, context) => {
const open_id = event.open_id;
const photo1 = event.photo1;
const photo2 = event.photo2;

  return {
    // photo1: photo1,
    // photo2: photo2,
    open_id: open_id
  }
};