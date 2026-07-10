import { lazy } from 'react';

const EOSBLandingPage = lazy(
    () => import('@src/domains/dashboard/EOSB/pages/EOSBLandingPage')
);

export const eosbRoutes = [{ element: <EOSBLandingPage />, index: true }];
