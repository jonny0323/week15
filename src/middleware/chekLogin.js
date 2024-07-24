const checkLogin = (req,res,next) =>{
    const idx=req.session.userId
    try{
        if(!idx){
            const error = new Error("로그인이 필요합니다.")
            error.statusCode = 401
            throw error
        }
        next() // 다음 미들웨어로 이동해주세요
    }catch(err){
        res.status(err.statusCode||500).send({
            "message" : err.message
        })
        
    }
    // next() // 다음 미들웨어로 이동해주세요

}
module.exports = checkLogin