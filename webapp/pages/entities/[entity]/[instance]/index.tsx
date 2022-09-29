import Head from "next/head";
import { InstanceMetrics } from "~/components/InstanceMetrics";

export default function InstacePage() {
  return (
    <>
      <Head>
        <title>Instances | Nile</title>
        <meta name="description" content="Clusters by user organization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <InstanceMetrics />
    </>
  )
};