import * as yup from "yup";

export const registerSchema = yup
  .object({
    username: yup
      .string()
      .required("Username is required!")
      .min(5, "Username should be at least 5 characters."),
    email: yup
      .string()
      .required("Email is required")
      .matches(/^[^@]+@[^@]+\.[^@ .]{2,}$/, "not a Valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password should be at least 6 characters."),
  })
  .required();

export const LoginSchema = yup
  .object({
    identifier: yup
      .string()
      .required("Email is required")
      .matches(/^[^@]+@[^@]+\.[^@ .]{2,}$/, "not a Valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password should be at least 6 characters."),
  })
  .required();
