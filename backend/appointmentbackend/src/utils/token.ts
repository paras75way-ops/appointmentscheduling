import jwt from "jsonwebtoken";

interface TokenUser {
  _id: unknown;
  role?: string;
  organizationId?: unknown;
}

export const generateAccessToken = (user: TokenUser): string => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId || null,
    },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user: TokenUser): string => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId || null,
    },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
};