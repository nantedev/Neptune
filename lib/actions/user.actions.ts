'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { auth, signIn, signOut } from '@/auth';
import {
  signInFormSchema,
  signUpFormSchema,
  shippingAddressSchema,
  paymentMethodSchema,
  updateUserSchema,
} from '../validator';
import { z } from 'zod';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

export async function signInWithCredentials(
    prevState: unknown,
    formData: FormData
  ) {
    try {
      const user = signInFormSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      });
  
      await signIn('credentials', user);
  
      return { success: true, message: 'Connexion réussie' };
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
  
      return { success: false, message: 'Email ou mot de passe invalide' };
    }
  }

  export async function signOutUser() {
    await signOut();
  }

  export async function signUp(prevState: unknown, formData: FormData) {
    try {
      const user = signUpFormSchema.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        confirmPassword: formData.get('confirmPassword'),
        password: formData.get('password'),
      });
  
      const plainPassword = user.password;
  
      user.password = hashSync(user.password, 10);
  
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      });
  
      await signIn('credentials', {
        email: user.email,
        password: plainPassword,
      });
  
      return { success: true, message: 'Utilisateur créé avec succès' };
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
  
      return {
        success: false,
        message: formatError(error),
      };
    }
  }

  export async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
  
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  }

  // Update user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');

    const currentUser = await prisma.user.findFirst({
      where: { id: session.user.id },
    });

    if (!currentUser) throw new Error('Utilisateur non trouvé');

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: 'Utilisateur mis à jour',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');

    const currentUser = await prisma.user.findFirst({
      where: { id: session.user.id },
    });
    if (!currentUser) throw new Error('Utilisateur non trouvé');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: 'Utilisateur mis à jour avec succès',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User not authenticated');

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!currentUser) throw new Error('Utilisateur non trouvé');

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    revalidatePath('/user/profile-form')

    return {
      success: true,
      message: 'Utilisateur mis à jour',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete user by ID
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'Utilisateur supprimé',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'Utilisateur mis à jour',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}