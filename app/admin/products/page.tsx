import { requireAdmin } from "@/lib/auth-guard";
import Link from 'next/link';
import { formatCurrency, formatId } from '@/lib/utils';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { getAllProducts, deleteProduct } from '@/lib/actions/product.actions';
import DeleteDialog from '@/components/shared/delete-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const AdminProductsPage = async (props: {searchParams: Promise<{
    page: string;
    query: string;
    category: string;
}>}) => {
    await requireAdmin();
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchText = searchParams.query || '';
    const category = searchParams.category || '';

    const products = await getAllProducts({
        query: searchText,
        page,
        category,
      });
      
    console.log(products);
    
    return (
      <div className='space-y-2'>
        <div className='flex-between'>
            <div className="flex items-center gap-3">
              <h1 className='h2-bold'>Produits</h1>
              {searchText && (
                <div>
                  Filtrés par <i>&quot;{searchText}&quot;</i>{' '}
                  <Link href={`/admin/products`}>
                    <Button variant='outline' size='sm'>
                      supprimer le filtre
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          <Button asChild variant='default'>
            <Link href='/admin/products/create'>Ajouter un produit</Link>
          </Button>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NOM</TableHead>
                <TableHead className='text-right'>PRIX</TableHead>
                <TableHead>CATEGORIE</TableHead>
                <TableHead>STOCK</TableHead>
                <TableHead>RATING</TableHead>
                <TableHead className='w-[100px]'>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{formatId(product.id)}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.rating}</TableCell>
                  <TableCell className='flex gap-1'>
                    <Button asChild variant='outline' size='sm'>
                      <Link href={`/admin/products/${product.id}`}>Editer</Link>
                    </Button>
                    <DeleteDialog id={product.id} action={deleteProduct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.totalPages > 1 && (
            <Pagination page={page} totalPages={products.totalPages} />
          )}
        </div>
      </div>
    );
  };
  
  export default AdminProductsPage;