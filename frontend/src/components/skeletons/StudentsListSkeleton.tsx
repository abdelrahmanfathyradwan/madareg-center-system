import '@/styles/skeleton.css';
import { TableSkeleton } from './TableSkeleton';

export const StudentsListSkeleton = () => (
  <TableSkeleton rows={8} columns={6} colWidths={['w-32','w-40','w-24','w-24','w-24','w-20']} />
);
