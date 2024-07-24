const CustomError = require("../const/customError");

const checkname = (req, res, next) => {
    const name = req.body.name;  // 수정된 부분
    const nameRegx = /^.{1,10}$/

    
    try {
        if (!name.match(nameRegx)) {
            throw new CustomError("name 값이 이상함", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkname;

