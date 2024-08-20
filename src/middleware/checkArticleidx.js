const CustomError = require("../const/customError");

const checkArticleidxp = (req, res, next) => {
    const articleIdx = req.params.idx;
    console.log('articleIdx:', articleIdx);
    try {
        if (!articleIdx) {
            throw new CustomError("게시글을 찾을 수 없습니다", 400);
        }
        next(); // 다음 미들웨어로 이동해주세요
    } catch (err) {
        res.status(err.statusCode || 500).send({
            "message": err.message
        });
    }
};

module.exports = checkArticleidxp;