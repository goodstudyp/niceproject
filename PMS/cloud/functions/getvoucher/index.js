const https = require('https');
const querystring = require('querystring');

exports.main = async (event, context) => {
 
    const postData = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: 'Smnw0T2b3aLmdbbToVaJDGfc',  
        client_secret: 'SJoP7eHA5r5QA96UNRRlfSfPb2ib8R7S'  
    });

  
    const options = {
        hostname: 'aip.baidubce.com',
        path: '/oauth/2.0/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

   
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.access_token);  
                } catch (error) {
                    reject(new Error('解析响应数据失败: ' + error.message));
                }
            });
        });

       
        req.on('error', (error) => {
            reject(new Error('请求失败: ' + error.message));
        });

        req.write(postData);
        req.end();
    });
};
