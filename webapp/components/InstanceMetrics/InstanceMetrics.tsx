import { Box, Button, Link, Stack, Typography } from "@mui/joy";
import { Queries, useNile, useQuery } from "@theniledev/react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import getConfig from "next/config";
import { useRouter } from "next/router";
import { useFirstOrg } from "../EntityTable/hooks";
import NavBar from "../NavBar";
import RequestLineChart from "./RequestsLineChart";
import ThroughputTotal from './ThroughputTotal';
import UpTime from "./UpTime";

export default function InstanceMetrics() {
  const router = useRouter();
  const instanceId = String(router.query.instance);

  const { publicRuntimeConfig } = getConfig();

  const { NILE_ENTITY_NAME, NILE_ORGANIZATION_NAME } = publicRuntimeConfig;

  const nile = useNile();
  const [loadingOrg, ,org] = useFirstOrg();

  const { isLoading, data: instance} = useQuery(
    Queries.GetInstance(NILE_ENTITY_NAME, NILE_ORGANIZATION_NAME, instanceId), 
    () => nile.entities.getInstance({
      org: String(org?.id),
      type: NILE_ENTITY_NAME, 
      id: instanceId
    }), 
    { enabled: !!org }
  );

  const { properties } = instance ?? {} as Record<string, any>;

  return (
    <NavBar> 
      <Button 
        href={`/entities/${NILE_ENTITY_NAME}`}
        component="a"
        variant="outlined"
        startDecorator={<ArrowBackIcon />}>
          Back to entities
      </Button>
      <Stack direction="row" sx={{ justifyContent: "space-between", pb: 2 }}>
        <Stack>
          <Typography level="h2">{properties?.dbName}</Typography>
          <Typography level="body4">{instance?.id}</Typography>
        </Stack>
        <Stack>
          <Typography level="h2" sx={{ textAlign: 'end'}}>
            {properties?.cloud}
          </Typography>
          <Stack direction="row" sx={{
              alignItems: 'center',
              gap: 1,
              justifyContent: 'flex-end'
            }}
          >
            <Typography level="body4">Compute resources:</Typography>
            <Typography>{properties?.size}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <UpTime />
      <Stack sx={{ flexWrap: 'wrap', mt: 2 }} direction="row">
        <Box sx={{width: '50%'}}>
          <RequestLineChart />
        </Box>
        <Box sx={{width: '50%'}}>
          <ThroughputTotal />
        </Box>
      </Stack>
    </NavBar>
  );
}