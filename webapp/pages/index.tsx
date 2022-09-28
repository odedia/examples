import type { NextPage } from 'next';
import Head from 'next/head';

import MyLoginForm from '~/components/MyLoginForm';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Nile App</title>
        <meta name="description" content="Welcome to Nile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/** wrapper around the nile login form */}
      <MyLoginForm />
    </>
  );
};

export default Home;
