import React from 'react';
import { Alert, Button, Modal, ModalClose, Sheet, Stack } from '@mui/joy';
import getConfig from 'next/config';
import { EntityForm } from '@theniledev/react';

import fields from './FormFields';

export function CreateInstance(props: {
  org: string;
  setReRender: () => void;
}) {
  const { org, setReRender } = props;
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <Stack>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: '50rem',
            minWidth: '30rem',
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <ModalClose
            variant="outlined"
            sx={{
              top: 'calc(-1/4 * var(--IconButton-size))',
              right: 'calc(-1/4 * var(--IconButton-size))',
              boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
              borderRadius: '50%',
              bgcolor: 'background.body',
            }}
          />
          {error && <Alert color="danger">{error}</Alert>}
          <EntityForm
            fields={fields}
            entityType={NILE_ENTITY_NAME}
            onSuccess={() => {
              setOpen(false);
              setReRender();
            }}
            org={org}
            onError={(e) => {
              if (e instanceof Error) {
                setError(`Failed to create ${NILE_ENTITY_NAME}.`);
              }
            }}
          />
        </Sheet>
      </Modal>
      <Button onClick={() => setOpen(true)}>Create {NILE_ENTITY_NAME}</Button>
    </Stack>
  );
}
