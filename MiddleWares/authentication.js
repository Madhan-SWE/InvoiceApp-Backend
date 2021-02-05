const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");


function authorizeUser(req, res, next) {
    if (req.headers.authorization != undefined) {
        jwt.verify(
            req.headers.authorization,
            process.env.JWT_KEY,
            (err, decode) => {
                if (err) {
                    console.log("err", err.toString(), "---");
                    if (err.toString().includes("TokenExpiredError")) {
                        res.status(401).json({
                            message: "Token Expired, Please login Again.",
                            result: false,
                        });
                        return;
                    }

                    console.log(err);
                    throw err;
                }

                if (decode) {
                    console.log(decode);
                    next();
                } else {
                    res.status(401).json({
                        result: false,
                        message: "User not logged in",
                    });
                }
            }
        );
    } else {
        res.status(401).json({ result: false, message: "User not logged in" });
    }
}

function allowPermittedUser(roles) {
    return function (req, res, next) {
        let authHeader = req.headers.authorization;
        let decodedHeader = jwt_decode(authHeader);
        let userType = decodedHeader.userType;
        if (userType && roles.includes(userType)) {
            next();
        } else {
            res.status(403).json({
                message: "FORBIDDEN",
                result: false,
            });
        }
    };
}

function allowPermittedAccess(accessIdx) {
    return function (req, res, next) {
        let authHeader = req.headers.authorization;
        let decodedHeader = jwt_decode(authHeader);
        let access = decodedHeader.access;
        if (access && access[accessIdx] === "1") {
            next();
        } else {
            res.status(403).json({
                message: "FORBIDDEN",
                result: false,
            });
        }
    };
}

module.exports = { authorizeUser, allowPermittedUser, allowPermittedAccess };
