const zod = require("zod");

const userSchema = zod.object({
  firstName: zod
    .string()
    .transform((s) => s.trim())
    .optional(),
  lastName: zod
    .string()
    .transform((s) => s.trim())
    .optional(),
  email: zod.string(),
  password: zod.string(),
});

module.exports = {
  userSchema,
};
