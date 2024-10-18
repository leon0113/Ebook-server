import { z } from "zod";
import { newAuthorSchema } from "./middlewares/validator.middleware";


export type authorReqBody = z.infer<typeof newAuthorSchema>