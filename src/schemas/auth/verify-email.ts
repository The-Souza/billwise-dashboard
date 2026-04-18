import z from "zod";

export const resendConfirmationSchema = z.string().email("Email inválido");
