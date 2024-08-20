const multer = require('multer');
const multerS3 = require('multer-s3');
const moment = require('moment');
const AWS = require('aws-sdk');

// AWS S3 클라이언트 생성
const s3 = new AWS.S3({
    accessKeyId: process.env.myAccessKeyId,
    secretAccessKey: process.env.mySecretAccessKey,
    region: "ap-northeast-2"
});

// multerS3 설정
const storage = multerS3({
    s3: s3,
    acl: 'public-read',  // 파일 접근 권한 설정
    bucket: "onlyjoke",  // S3 버킷 이름
    key: (req, file, callback) => {
        let dir = req.body.dir ? `${req.body.dir}/` : '';  // 디렉토리 이름을 가져오고, 없으면 빈 문자열로 설정
        let datetime = moment().format('YYYYMMDDHHmmss');
        
        // 디렉토리와 파일명을 결합하여 파일 경로 설정
        let filePath = `${dir}${datetime}_${file.originalname}`;
        
        console.log('Directory:', dir);  // 디버깅용
        console.log('File Path:', filePath);  // 디버깅용
        
        callback(null, filePath);  // S3에 저장될 파일 경로 설정
    }
});

// multer 설정
const upload = multer({ storage: storage });

module.exports = { upload, s3 };