import dynamic from 'next/dynamic';

// https://nextjs.org/docs/advanced-features/dynamic-import
const Table = dynamic(() => import('./EntityTable'));

export default Table;
