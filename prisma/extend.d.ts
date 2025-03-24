import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  namespace Prisma {
    // Extend UserUpdateInput to include twoFactor fields
    interface UserUpdateInput {
      twoFactorSecret?: string | null;
      twoFactorEnabled?: boolean;
    }
    
    interface UserUncheckedUpdateInput {
      twoFactorSecret?: string | null;
      twoFactorEnabled?: boolean;
    }
    
    interface UserSelect {
      twoFactorSecret?: boolean;
      twoFactorEnabled?: boolean;
    }
  }
}
