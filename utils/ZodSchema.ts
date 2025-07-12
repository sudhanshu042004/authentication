import z from "zod"

export const LoginBody = z.object({
    email : z.email(),
    password : z.string().min(8).max(16)
})

export const SignUpBody = z.object({
    email : z.email(),
    password : z.string().min(8).max(16),
    name : z.string(),
})

export const UpdateUserBody = z.object({
    name : z.string().optional(),
    avatar : z.string().optional(),
})