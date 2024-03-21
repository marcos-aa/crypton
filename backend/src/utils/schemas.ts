import Joi from "joi"

const messages = {
  success: "Success...",
  codeSent: "Verification code sent.",
  networkError: "Something went wrong. Verify your connection and try again.",
  duplicateEmail: "This email is already registered.",
  validate: "Pending email validation.",
  verifyEmail: "Please validate your email first.",
  expiredCode: "Code expired.",
  noCode: "No user code.",
  noUser: "This user doesn't exist.",
  noToken: "Missing token.",
  invalidCredentials: "Invalid email or password.",
  invalidToken: "Invalid token.",
  invalidCode: "Invalid code.",
} as const

export class CredError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const oidSchema = Joi.string().hex().length(24)

const userSchema = Joi.object({
  name: Joi.string().pattern(/\w/).required().messages({
    "string.min": "Name must contain at least two characters",
    "string.pattern.base": "Name must only contain word characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must contain a valid domain",
  }),
  pass: Joi.string()
    .pattern(/^([^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/, {
      invert: true,
    })
    .min(8)
    .max(32)
    .required()
    .messages({
      "string.min": "Password must have at least 8 characters",
      "string.max": "Password must have at most 32 characters",
      "string.pattern.invert.base":
        "Password must combine special, uppercase, lowercase and digit characters",
    }),
})

const symMessages = {
  string: {
    "string.pattern.base": "Symbol doesn't match available symbols",
    "string.min": "Symbol must have at least 5 characters",
    "string.max": "Symbols must have a maximum of 13 characters",
  },
  arr: {
    "array.min": "A minimum of 1 symbol per stream is required",
    "array.max": "A maximum of 5 symbols per stream is allowed",
  },
}

const symbolsSchema = Joi.array()
  .items(
    Joi.string()
      .min(5)
      .max(13)
      .pattern(/^[0-9A-Z]{5,13}$/)
      .messages(symMessages.string)
  )
  .min(1)
  .max(5)
  .required()
  .messages(symMessages.arr)

const streamSchema = Joi.object({
  user_id: oidSchema,
  id: oidSchema,
  symbols: symbolsSchema,
})

const rawSchema = Joi.array()
  .items({
    _id: {
      $oid: oidSchema,
    },
    symbols: symbolsSchema,
    user_id: oidSchema,
  })
  .min(1)

export { messages, oidSchema, rawSchema, streamSchema, symMessages, userSchema }
