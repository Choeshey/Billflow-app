import { z } from "zod";

// ── Auth ───────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email:    z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const RegisterSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters.").max(100),
  email:    z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
              .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
              .regex(/[0-9]/, "Must contain at least one number."),
});

// ── Clients ────────────────────────────────────────────────────────────────
export const CreateClientSchema = z.object({
  name:    z.string().min(1, "Name is required.").max(200),
  email:   z.string().email("Invalid email.").optional().or(z.literal("")),
  company: z.string().max(200).optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// ── Invoices ───────────────────────────────────────────────────────────────
export const CreateInvoiceSchema = z.object({
  amount:   z.number().positive("Amount must be positive.").max(9_999_999),
  status:   z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]).default("DRAFT"),
  dueDate:  z.string().datetime("Invalid date format."),
  clientId: z.string().uuid("Invalid client ID."),
  notes:    z.string().max(1000).optional(),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

// ── Helpers ────────────────────────────────────────────────────────────────
/**
 * Validate request body against a Zod schema.
 * Returns { data } on success or { error, status } on failure.
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: string; status: number }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: "Invalid JSON body.", status: 400 };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    // @ts-ignore
    const message = result.error.errors.map(e => e.message).join(" ");
    return { error: message, status: 422 };
  }

  return { data: result.data };
}