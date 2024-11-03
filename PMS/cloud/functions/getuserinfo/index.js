const cloud = require('@alipay/faas-server-sdk'); 
cloud.init();  
exports.main = async (event, context) => {   
const res = await cloud.openapi.alipaySystemOauthToken.request({     
    grant_type: 'authorization_code',   
    
    code: event.authCode,   
  });   
   
   return res;
};