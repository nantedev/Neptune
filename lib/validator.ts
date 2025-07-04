import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Le prix doit avoir exactement deux décimales (ex. : 49.99)'
  );

// Schéma pour insérer un produit
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères'),
  category: z.string().min(3, 'La catégorie doit contenir au moins 3 caractères'),
  brand: z.string().min(3, 'La marque doit contenir au moins 3 caractères'),
  description: z.string().min(3, 'La description doit contenir au moins 3 caractères'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Un produit doit avoir au moins une image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating a product
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'Id est requis'),
});


export const signInFormSchema = z.object({
  email: z.string().email('Adresse e-mail invalide').min(3, 'L\'e-mail doit contenir au moins 3 caractères'),
  password: z.string().min(3, 'Le mot de passe doit contenir au moins 3 caractères'),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    email: z.string().min(3, 'L\'e-mail doit contenir au moins 3 caractères'),
    password: z.string().min(3, 'Le mot de passe doit contenir au moins 3 caractères'),
    confirmPassword: z
      .string()
      .min(3, 'La confirmation du mot de passe doit contenir au moins 3 caractères'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  qty: z.number().int().nonnegative('La quantité doit être un nombre positif ou nul'),
  image: z.string().min(1, 'L\'image est requise'),
  price: z
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(Number(value).toFixed(2)),
      'Le prix doit avoir exactement deux décimales (ex. : 49.99)'
    ),
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'L\'identifiant du panier est requis'),
  userId: z.string().optional().nullable(),
});

export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    streetAddress: z.string().min(3, 'L\'adresse doit contenir au moins 3 caractères'),
    city: z.string().min(3, 'La ville doit contenir au moins 3 caractères'),
    postalCode: z.string().min(3, 'Le code postal doit contenir au moins 3 caractères'),
    country: z.string().min(3, 'Le pays doit contenir au moins 3 caractères'),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Le mode de paiement est requis'),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Mode de paiement invalide',
  });

export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User est requis'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
      message: 'methode de paiement invalide',
    }),
    shippingAddress: shippingAddressSchema,
  });

export const insertOrderItemSchema = z.object({
    productId: z.string(),
    slug: z.string(),
    image: z.string(),
    name: z.string(),
    price: currency,
    qty: z.number(),
  });

  export const paymentResultSchema = z.object({
    id: z.string(),
    status: z.string(),
    email_address: z.string(),
    pricePaid: z.string(),
  });

export const updateProfileSchema = z.object({
    name: z.string().min(3, 'Nom doit contenir au moins 3 caractères'),
    email: z.string().min(3, 'Email doit contenir au moins 3 caractères'),
  });

// Update User Schema
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'Id est requis'),
  name: z.string().min(3, 'Nom doit contenir au moins 3 caractères'),
  role: z.string().min(1, 'Role est requis'),
});

// Insert Review Schema
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(3, 'La description doit contenir au moins 3 caractères'),
  productId: z.string().min(1, 'Le produit est requis'),
  userId: z.string().min(1, "L'utilisateur est requis"),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'La note doit être d\'au moins 1')
    .max(5, 'La note doit être au maximum 5'),
});

