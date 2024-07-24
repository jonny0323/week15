const CustomError = require("../const/customError");

const checkid = (req, res, next) => {
    console.log(res.locals.id)
    const id = res.locals.id;  // 수정된 부분
    const idRegx = /^.{1,10}$/

    
    try {
        if (!id.match(idRegx)) {    
            throw new CustomError("id 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkid;

