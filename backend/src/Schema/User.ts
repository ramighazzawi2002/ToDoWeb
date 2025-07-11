import vine from "@vinejs/vine";

const UserSignUpSchema = vine.object({
  firstName: vine.string().trim().minLength(2).maxLength(50),
  lastName: vine.string().trim().minLength(2).maxLength(50),
  email: vine.string().email().normalizeEmail(),
  password: vine.string().minLength(6).maxLength(100),
});

const UserSignInSchema = vine.object({
  email: vine.string().email().normalizeEmail(),
  password: vine.string().minLength(6),
});

export { UserSignUpSchema, UserSignInSchema };
