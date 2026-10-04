'use strict';

/**
 * Validate `req.body` against a zod schema. On success, replaces req.body with
 * the parsed (and coerced) value. On failure, responds 422 with field errors.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return res.status(422).json({
        error: 'validation_error',
        message: 'Please check the highlighted fields.',
        fields: fieldErrors,
      });
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { validateBody };
