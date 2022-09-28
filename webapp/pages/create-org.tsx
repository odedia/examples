import type { NextPage } from 'next';
import Head from 'next/head';

import AddOrgForm from '~/components/CreateOrg';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Nile App</title>
        <meta name="description" content="Create Org" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/** wrapper around the nile login form */}
      <AddOrgForm />
    </>
  );
};

export default Home;
