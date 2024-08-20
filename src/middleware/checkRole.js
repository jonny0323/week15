const checkAdmin = (req,res,next) =>{
    const role = req.decoded.idx
    try{
        if(role !== 1){
            const error = new Error("관리자 권한이 필요합니다")
            error.statusCode = 403
            throw error
        }
        next()
    }catch(err){
        res.status(err.statusCode||500).send({
            "message" : err.message
        })
    }
}
module.exports = checkAdmin