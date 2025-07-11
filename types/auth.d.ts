import type { LoginBody } from "./ZodSchema";

type Login = z.infer<typeof LoginBody>