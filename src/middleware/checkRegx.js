const CustomError = require("../const/customError");
const { titleRegx, contentRegx, pwRegx, idRegx, tellRegx, nameRegx, commentRegx, articleidx } = require("../const/regx");

const checkRegx = (param) => {
    return (req, res, next) => {
        try {
            // req.body[param[0]] 또는 req.params[param[0]] 값이 존재하는지 확인 후 match 실행
            const valueToCheck = req.body[param[0]] || req.params[param[0]];
            console.log("valueToCheck")
            if (!valueToCheck || !valueToCheck.match(param[1])) {
                throw new CustomError(`${param[0]} 값이 이상함`, 400);
            }

            next(); // 다음 미들웨어로 이동
        } catch (err) {
            // 이미 응답이 전송된 경우, 다음 에러 핸들러로 넘김
            if (res.headersSent) {
                return next(err);
            }

            res.status(err.statusCode || 500).send({
                message: err.message
            });
        }
    };
};

module.exports = checkRegx;