import { body, validationResult } from "express-validator";
export const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                break;
            }
        }
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(422).json({ errors: errors.array() });
    };
};
export const loginValidator = [
    body("email").trim().isEmail().withMessage("Please Enter an Email"),
    body("password").trim().isLength({ min: 6 }).withMessage("Please Enter a Password with at least 6 Characters"),
];
export const signupValidator = [
    body("name").notEmpty().withMessage("Please Enter a Name"),
    ...loginValidator,
];
export const chatCompletionValidator = [
    body("message").notEmpty().withMessage("Please Enter a Message"),
];
//# sourceMappingURL=validators.js.map