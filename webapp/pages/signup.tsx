import type { NextPage } from 'next';
import Head from 'next/head';

import MySignUpForm from '~/components/MySignupForm';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Nile App</title>
        <meta name="description" content="Welcome to Database SaaS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/** wrapper around the nile login form */}
      <MySignUpForm />
    </>
  );
};

export default Home;
