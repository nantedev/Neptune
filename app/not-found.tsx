'use client';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const NotFound = () => {
  const router = useRouter();
  
  return (
    <div className='flex flex-col items-center justify-center min-h-screen '>
      <Image
        priority={true}
        src='/images/logo.svg'
        width={48}
        height={48}
        alt={`${APP_NAME} logo`}
      />
      <div className='p-6 rounded-lg shadow-md w-1/3 text-center'>
        <h1 className='text-3xl font-bold mb-4'>Non trouvée</h1>
        <p className='text-destructive'>Je n&apos;arrive pas à trouver la page demandée</p>
        <Button
          variant='outline'
          className='mt-4 ml-2'
          onClick={() => router.push('/')}
        >
          Revenir à l&apos;accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;