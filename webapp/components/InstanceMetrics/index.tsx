import dynamic from "next/dynamic";

export const RequestLineChart = dynamic(() => import('./RequestsLineChart'));
export const InstanceMetrics = dynamic(() => import('./InstanceMetrics'));
