'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { USER_ROLES } from '@/lib/constants';
import { ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updateUserSchema } from '@/lib/validator';
import { updateUser } from '@/lib/actions/user.actions';

const UpdateUserForm = ({
  user,
}: {
  user: z.infer<typeof updateUserSchema>;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  // Handle submit
  const onSubmit = async (values: z.infer<typeof updateUserSchema>) => {
    try {
      const res = await updateUser({
        ...values,
        id: user.id,
      });
  
      if (!res.success) return toast.error(res.message);
  
      toast.success(res.message);
  
      form.reset();
      router.push(`/admin/users`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  

  return (
    <Form {...form}>
      <form method='post' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
      {/* Email */}
        <div>
        <FormField
            control={form.control}
            name='email'
            render={({
            field,
            }: {
            field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'email'>;
            }) => (
            <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                <Input disabled={true} placeholder='Entrer votre email' {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        </div>
        { /* Name */ }
          <div>
            <FormField
              control={form.control}
              name='name'
              render={({
                field,
              }: {
                field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'name'>;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder='Entrer votre nom' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          { /* Role */ }
          <div>
            <FormField
              control={form.control}
              name='role'
              render={({
                field,
              }: {
                field: ControllerRenderProps<z.infer<typeof updateUserSchema>, 'role'>;
              }) => (
                <FormItem className=' items-center'>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selectionner un rôle' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex-between'>
            <Button
                type='submit'
                className='w-full'
                disabled={form.formState.isSubmitting}
            >
                {form.formState.isSubmitting ? 'Envoi en cours...' : `Mettre à jour`}
            </Button>
            </div>
      </form>
    </Form>
  );
};

export default UpdateUserForm;