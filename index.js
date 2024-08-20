const express = require("express")
// import 하는 것

const app = express()
//express 열어주는 것
//db 연결

// const path = require("path") // 경로 개선해주는거임
// const fs = require("fs")

require("dotenv").config()
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
// const options = {
//     "key" : fs.readFileSync(path.join(__dirname,"./ssl/key.pem")),
//     "cert" : fs.readFileSync(path.join(__dirname,"./ssl/cert.pem")),
//     //"ca"
//     "passphrase" : "1234"
// }


// const cookieParser = require('cookie-parser');



app.use(express.json())

const logging = require("./src/middleware/logging")
const AWS = require('aws-sdk');


//use는 middleware를 등록할때 사용함.
//express.json()는 middleware 임
//string => json 으로 json dmf => string으로 바꿔줌
// 원래 json 은 원래 통신에서 사용할 수 없다.
// object 자료구조임.
// 통신에서 사용할 수 없는 자료형 or 자료구조는 parser 가 필요함.
// express.json() 을 통해서 보내는 것이 가능하다. 자동으로 변환시켜준다.
// const session = require('express-session');
// app.use(session({
//     secret: '123456789', // 반드시 고유한 비밀키로 변경하세요. //난수를 넣자
//     resave: false, // 세션이 수정되지 않더라도 세션을 다시 저장할지 여부
//     saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24 // 쿠키 만료 시간 (1일)
//     }
// }));


// app.use(cookieParser());

// Setup multer for file upload with S3



const CustomError = require('./src/const/customError');
const userRouter = require("./src/router/users")
app.use("/users", userRouter)
//users 연결하기
const articleRouter = require("./src/router/articles")
app.use("/articles", articleRouter)
//articles 연결하기 
const commentRouter = require("./src/router/comments")
app.use("/comments", commentRouter)
//comments 연결하기 
const categoryRouter = require("./src/router/categorys")
app.use("/categorys", categoryRouter)

app.use((req, res, next) =>{
    const error = new CustomError('Resource Not Found', 404);
    next(error);
})

app.use((err, req, res, next) => {
     console.log("에러핸들러 미들웨어 실행됨")

    res.status(err.statusCode || 500).send({
        msg: err.message || '예상못한 에러 발생'
    })
});

app.listen(8000, () => {
    console.log("8000번 포트에서 웹 서버 실행")
})
