import jwt from "jsonwebtoken";

type TokenType = "email-verify" | "password-reset";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required for email token generation.");
  }
  return secret;
}

function getEmailTokenExpireMinutes(): number {
  return Number(process.env.EMAIL_TOKEN_EXPIRE_MINUTES || 30);
}

export function generateEmailToken(email: string): string {
  return jwt.sign({ email, type: "email-verify" }, getJwtSecret(), {
    expiresIn: `${getEmailTokenExpireMinutes()}m`,
  });
}

export function generatePasswordResetToken(email: string): string {
  return jwt.sign({ email, type: "password-reset" }, getJwtSecret(), {
    expiresIn: `${getEmailTokenExpireMinutes()}m`,
  });
}

export function confirmEmailToken(token: string, expectedType: TokenType): string | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
    if (typeof payload.email !== "string") {
      return null;
    }
    if (payload.type !== expectedType) {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}
