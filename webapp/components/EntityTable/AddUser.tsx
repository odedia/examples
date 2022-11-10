import React from 'react';
import { Alert, Button, Modal, ModalClose, Sheet, Stack } from '@mui/joy';
import { Queries, SignUpForm } from '@theniledev/react';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNile } from '@theniledev/react';

export function AddUser(props: { org: string; setReRender?: () => void }) {
  const { org, setReRender } = props;
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const nile = useNile();

  const { data: orgs = [] } = useQuery(Queries.ListOrganizations, () =>
    nile.organizations.listOrganizations()
  );
  const addUserToOrg = React.useCallback(
    (email: string) => {
      return nile.organizations.addUserToOrg({
        org,
        addUserToOrgRequest: { email: email },
      });
    },
    [org, nile]
  );

  const mutation = useMutation(addUserToOrg, {
    onSuccess: () => {
      setOpen(false);
    },
    onError: (e: Error) => {
      if (typeof e.message === 'string') {
        setError(e.message);
      }
    },
  });

  const handleSave = React.useCallback(
    (email: string) => {
      setError('');
      mutation.mutate(email);
    },
    [mutation]
  );

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
          <SignUpForm
            onSuccess={(data) => {
              handleSave(data.email);
              setOpen(false);
              setReRender && setReRender();
            }}
            onError={(e) => {
              if (e instanceof Error) {
                setError(`Failed to add user: ${e}`);
              }
            }}
          />
        </Sheet>
      </Modal>
      {orgs.length > 0 && (
        <Button
          sx={{ justifyContent: 'flex-start' }}
          startDecorator={<AddCircleOutlineOutlinedIcon />}
          onClick={() => setOpen(true)}
        >
          Add new user to org
        </Button>
      )}
    </Stack>
  );
}
