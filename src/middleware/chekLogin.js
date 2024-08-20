const jwt = require("jsonwebtoken")


const checkLogin = (req,res,next) =>{
    // const idx=req.session.idx
    // try{
    //     if(!idx){
    //         const error = new Error("로그인이 필요합니다.")
    //         error.statusCode = 401
    //         throw error
    //     }
    //     next() // 다음 미들웨어로 이동해주세요
    // }catch(err){
    //     res.status(err.statusCode||500).send({
    //         "message" : err.message
    //     })
        
    // }
    // next() // 다음 미들웨어로 이동해주세요



    const token = req.headers.authorization
    try{
        console.log(process.env.myAccessKeyId)
        console.log(process.env.mySecretAccessKey)
        req.decoded= jwt.verify(token, process.env.Signature)
        next() 
    }catch(err){
        if(err.message === "jwt expired"){
            res.status(401).send({
                "message" : err.message
            })
        }else if(err.message === "invalid signature"){
            res.status(401).send({
                "message" : err.message
            })
        }else if(err.message === "jwt must be provided"){
            res.status(401).send({
                "message" : err.message
            })
        }else{
            console.log(process.env.myAccessKeyId)
                console.log(process.env.mySecretAccessKey)
            res.status(err.statusCode||500).send({
                
                "message" : err.message
            })
        }
    }




}
module.exports = checkLogin
