export class RefreshToken {
  id!: string;
  token!: string;
  userId!: string;
  expiresAt!: Date;
  createdAt!: Date;
  revoked!: boolean;
}
