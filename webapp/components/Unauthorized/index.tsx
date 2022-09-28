import dynamic from 'next/dynamic';

// https://nextjs.org/docs/advanced-features/dynamic-import
const Unauthorized = dynamic(() => import('./Unauthorized'));

export default Unauthorized;
