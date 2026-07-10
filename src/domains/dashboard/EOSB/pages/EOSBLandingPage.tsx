import React from 'react';

import useHideFooterAndBreadcrumbs from '@src/domains/dashboard/insurance/hooks/useHideFooterAndBreadcrumbs ';

const EOSBLandingPage: React.FC = () => {
    useHideFooterAndBreadcrumbs();

    return (
        <iframe
            src="https://eosb.hayah.com/peko"
            title="End of Service Benefits"
            className="w-full"
            style={{ height: 'calc(100vh - 172px)' }}
        />
    );
};

export default EOSBLandingPage;
