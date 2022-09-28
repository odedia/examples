import React from 'react';

import RawLogo from '~/images/cloud-db.svg'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

export default function Logo({ width = 131 }: { width?: number }) {
  return (
    <RawLogo style={{ fill: '#FF9333' }} width={`${width}px`} height="100%" />
  );
}
