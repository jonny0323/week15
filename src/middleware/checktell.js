const CustomError = require("../const/customError");

const checktell = (req, res, next) => {
    const tell = req.body.tell;  // 수정된 부분
    const tellRegx = /^(0[2-8]|\d{2,3})-\d{3,4}-\d{4}$/;

    
    try {
        if (!tell.match(tellRegx)) {
            throw new CustomError("tell 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checktell;

