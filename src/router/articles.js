const router = require("express").Router();
const { titleRegx, contentRegx, articleRegx } = require("../const/regx");
const CustomError = require("../const/customError");
const checkLogin = require("../middleware/chekLogin");
const checkRegx = require("../middleware/checkRegx");
const client = require("../const/PostgreSQL.js");
const checkRole = require("../middleware/checkRole");
const wrap = require("../const/wrapper.js");
const multer = require('multer');
const path = require('path');
const {upload,s3} = require('../middleware/upload.js');

// 게시판 생성하기
router.post("/", 
    checkLogin,
    upload.single('photo'),  // 단일 파일 업로드
    checkRegx(["title", titleRegx]), 
    checkRegx(["content", contentRegx]), 
    wrap(async (req, res, next) => {
        const userIdx = req.decoded.idx;
        const { title, content, categoryIdx } = req.body;
        
        // 업로드된 파일의 URL
        const imageUrl = req.file ? req.file.location : null;

        console.log(title, content, categoryIdx, imageUrl);

        await client.query(
            "INSERT INTO project.article (account_idx, title, content, category_idx,image_url) VALUES ($1, $2, $3, $4,$5);",
            [userIdx, title, content, categoryIdx,imageUrl]
        );

        res.status(200).json({ message: 'Article created successfully' });
    })
);



// 게시판 보기
router.get("/:idx/detail", checkRegx(["idx", articleRegx]), wrap(async (req, res, next) => {
    const articleIdx = req.params.idx;
    const getArticleResult = await client.query(
        "SELECT * FROM project.article WHERE idx = $1;",
        [articleIdx]
    );
    
    if (getArticleResult.rows.length === 0) {
        return next(new CustomError('Article not found', 404));
    }

    res.status(200).json({ article: getArticleResult.rows[0] });
}));

// 게시판 수정하기
router.put("/:idx", 
    checkLogin, 
    upload.single('photo'),  // 단일 파일 업로드
    checkRegx(["idx", articleRegx]), 
    checkRegx(["title", titleRegx]),  
    checkRegx(["content", contentRegx]), 
    wrap(async (req, res, next) => {
        const { title, content, categoryIdx } = req.body;
        const articleIdx = req.params.idx;

        const getArticleResult = await client.query(
            "SELECT account_idx, image_url FROM project.article WHERE idx = $1;",
            [articleIdx]
        );

        if (getArticleResult.rows[0].account_idx !== req.decoded.idx) {
            return next(new CustomError('권한이 없습니다', 401));
        }

        // 새 이미지가 업로드되면 기존 이미지 삭제
        const oldImageUrl = getArticleResult.rows[0].image_url;
        if (req.file && oldImageUrl) {
            const imageKey = oldImageUrl.split('.com/')[1];

            s3.deleteObject({ Bucket: "onlyjoke", Key: imageKey }, (err, data) => {
                if (err) {
                    console.log("S3 이미지 삭제 중 오류 발생: ", err);
                } else {
                    console.log("기존 이미지가 성공적으로 삭제되었습니다: ", data);
                }
            });
        }

        // 새로운 이미지 URL 설정
        const newImageUrl = req.file ? req.file.location : oldImageUrl;

        await client.query(
            "UPDATE project.article SET title = $1, content = $2, category_idx = $3, image_url = $4 WHERE idx = $5;",
            [title, content, categoryIdx, newImageUrl, articleIdx]
        );

        res.status(200).json({ message: 'Article updated successfully' });
    })
);


// 게시판 삭제하기
router.delete("/:idx/detail", 
    checkLogin, 
    checkRegx(["idx", articleRegx]), 
    wrap(async (req, res, next) => {
        const articleIdx = req.params.idx;

        // 게시글의 정보를 가져옵니다.
        const getArticleResult = await client.query(
            "SELECT account_idx, image_url FROM project.article WHERE idx = $1;",
            [articleIdx]
        );

        // 게시글이 없을 경우 오류 처리
        if (getArticleResult.rows.length === 0) {
            return next(new CustomError('Article not found', 404));
        }

        // 사용자 권한 체크
        if (getArticleResult.rows[0].account_idx !== req.decoded.idx) {
            return next(new CustomError('권한이 없습니다', 401));
        }

        // 이미지 URL이 존재하는 경우 S3에서 삭제
        const imageUrl = getArticleResult.rows[0].image_url;
        if (imageUrl) {
            const imageKey = imageUrl.split('.com/')[1];

            const params = {
                Bucket: "onlyjoke",  // S3 버킷 이름
                Key: imageKey
            };

            s3.deleteObject(params, (err, data) => {
                if (err) {
                    console.log("S3 이미지 삭제 중 오류 발생: ", err);
                } else {
                    console.log("S3 이미지가 성공적으로 삭제되었습니다: ", data);
                }
            });
        }

        // 게시글 삭제
        await client.query(
            "DELETE FROM project.article WHERE idx = $1;",
            [articleIdx]
        );
        
        res.status(200).json({ message: 'Article deleted successfully' });
    })
);
// 카테고리 보기
router.get("/list", wrap(async (req, res, next) =>  {
    const categoryIdx = req.query.categoryIdx;
    const getCategoryResult = await client.query(
        "SELECT * FROM project.article WHERE category_idx = $1;",
        [categoryIdx]
    );
    res.status(200).json({ getCategoryRows: getCategoryResult.rows });
}));

// 게시글 좋아요 누르기
router.post("/:idx/like", 
    checkLogin, 
    checkRegx(["idx", articleRegx]), 
    wrap(async (req, res, next) => {
        const articleIdx = req.params.idx;
        const userIdx = req.decoded.idx;

        await client.query('BEGIN;');

        const selectResult = await client.query(
            'SELECT * FROM project.article_like WHERE article_idx = $1 AND account_idx = $2',
            [articleIdx, userIdx]
        );

        if (selectResult.rows.length >= 1) {
            await client.query('ROLLBACK');
            return next(new CustomError('이미 좋아요를 눌렀습니다', 409));
        }

        await client.query(
            'INSERT INTO project.article_like (article_idx, account_idx) VALUES ($1, $2);',
            [articleIdx, userIdx]
        );

        await client.query('COMMIT;');

        res.status(200).json({});
    })
);

// 게시글 좋아요 취소하기
router.delete("/:idx/like", 
    checkLogin, 
    checkRegx(["idx", articleRegx]), 
    wrap(async (req, res, next) => {
        const articleIdx = req.params.idx;
        const userIdx = req.decoded.idx;

        await client.query('BEGIN;');

        const selectResult = await client.query(
            'SELECT * FROM project.article_like WHERE article_idx = $1 AND account_idx = $2',
            [articleIdx, userIdx]
        );

        if (selectResult.rows.length < 1) {
            await client.query('ROLLBACK');
            return next(new CustomError('이미 좋아요가 취소되었습니다', 409));
        }

        await client.query(
            'DELETE FROM project.article_like WHERE article_idx = $1 AND account_idx = $2;',
            [articleIdx, userIdx]
        );

        await client.query('COMMIT;');

        res.status(200).json({});
    })
);

module.exports = router;
