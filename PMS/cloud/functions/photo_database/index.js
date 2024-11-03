const cloud = require("@alipay/faas-server-sdk");
exports.main = async (event, context) => {
  const db = cloud.database(); 
  const collection = db.collection('user_photo'); 


  const photo1FileId = event.photo1FileId; 
  const photo2FileId = event.photo2FileId;
  const photo_type = event.photo_type; 
  const open_id = event.open_id;

  const uploadTime = new Date().toISOString(); 

  try {
    
    const result = await collection.add({
      data: {
        
        uploadTime: uploadTime,
        photo1FileId: photo1FileId,
        photo2FileId: photo2FileId,
        photo_type: photo_type,
        open_id : open_id
      }
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('数据插入失败:', error);
    return {
      success: false,
      errorMessage: error
    };
  }

};