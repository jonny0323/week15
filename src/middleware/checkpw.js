const CustomError = require("../const/customError");

const checkpw = (req, res, next) => {
    const pw = res.locals.pw;  // 수정된 부분
    const pwRegx = /^.{1,10}$/

    
    try {
        if (!pw.match(pwRegx)) {
            throw new CustomError("pw 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkpw;

