const checkRole = (req,res,next) =>{
    const role = req.session.role
    try{
        if(role !== "admin"){
            const error = new Error("관리자 권한이 필요합니다")
            error.statusCode = 403
            throw error
        }
    }catch(err){
        req.status(err.statusCode||500).send({
            "message" : err.message
        })
    }



}
module.exports = checkRole