/** @type {import('next').NextConfig} */
// keeping things consistent with the examples
const fs = require('fs');
const path = require('path');

const envPath = './.env';
let runtimeConfig = {};

// Local webapp only: validate user has taken the step to setup certificates
const isVercel = process.env.VERCEL === '1' || false;
if (!isVercel) {
  const certificateDir = './.certificates';
  if (!fs.existsSync(certificateDir)) {
    console.log(
      `Error: directory ${certificateDir} does not exist. Did you forget to setup your local certificates? Refer to the README.md for instructions`
    );
    process.exit(1);
  }
}

// reads from .env to expose values to the client
function readVarsFile() {
  const file = fs.readFileSync(envPath, 'utf8');
  const lines = file.split('\n');
  runtimeConfig = lines.reduce((accum, line) => {
    if (line.startsWith('#') || !line) {
      return accum;
    }
    const [name, value] = line.split('=');

    // webapp customizations depending on the entity type
    if (name.includes('NILE_ENTITY_NAME')) {
      // Copy logo.svg
      const src = `./form-fields/${value}/logo.svg`;
      const dst = './public/images/logo.svg';
      fs.copyFileSync(src, dst, fs.constants.COPYFILE_FICLONE);
      console.log(`Success: copied ${src} to ${dst}`);

      // Print valid admins who can log in
      const admins = fs.readFileSync(
        `../usecases/${value}/init/admins.json`,
        'utf8'
      );
      console.log(
        `Login as any of these predefined admins, or signup a new one: \n${admins}`
      );

      // Print valid users who can log in
      const users = fs.readFileSync(
        `../usecases/${value}/init/users.json`,
        'utf8'
      );
      console.log(
        `Login as any of these predefined users, or signup a new one: \n${users}`
      );
    }

    accum[name] = value;
    return accum;
  }, {});
}

try {
  readVarsFile();
} catch (err) {
  let envParams = [
    'NEXT_PUBLIC_NILE_URL',
    'NEXT_PUBLIC_NILE_WORKSPACE',
    'NEXT_PUBLIC_NILE_ENTITY_NAME',
  ];
  envParams.forEach((key) => {
    if (!process.env[key]) {
      console.error(
        `Error: missing .env file for local testing, or missing environment variable ${key} for Vercel`
      );
      process.exit(1);
    }
  });
  let data = `
NILE_URL=${process.env.NEXT_PUBLIC_NILE_URL}
NILE_WORKSPACE=${process.env.NEXT_PUBLIC_NILE_WORKSPACE}
NILE_ENTITY_NAME=${process.env.NEXT_PUBLIC_NILE_ENTITY_NAME}
NEXT_PUBLIC_NILE_URL=${process.env.NEXT_PUBLIC_NILE_URL}
NEXT_PUBLIC_NILE_WORKSPACE=${process.env.NEXT_PUBLIC_NILE_WORKSPACE}
NEXT_PUBLIC_NILE_ENTITY_NAME=${process.env.NEXT_PUBLIC_NILE_ENTITY_NAME}
`;
  fs.writeFileSync(envPath, data);
  readVarsFile();
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  publicRuntimeConfig: runtimeConfig,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    if (options.isServer) {
      config.externals = ['@tanstack/react-query', ...config.externals];
    }

    const reactQuery = path.resolve(require.resolve('@tanstack/react-query'));

    config.resolve.alias['@tanstack/react-query'] = reactQuery;

    return config;
  },
};

module.exports = nextConfig;
