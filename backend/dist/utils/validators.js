"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatCompletionValidator = exports.signupValidator = exports.loginValidator = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                break;
            }
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(422).json({ errors: errors.array() });
    };
};
exports.validate = validate;
exports.loginValidator = [
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Please Enter an Email"),
    (0, express_validator_1.body)("password").trim().isLength({ min: 6 }).withMessage("Please Enter a Password with at least 6 Characters"),
];
exports.signupValidator = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Please Enter a Name"),
    ...exports.loginValidator,
];
exports.chatCompletionValidator = [
    (0, express_validator_1.body)("message").notEmpty().withMessage("Please Enter a Message"),
];
//# sourceMappingURL=validators.js.map