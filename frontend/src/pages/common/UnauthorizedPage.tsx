import * as React from 'react';

import './UnauthorizedPage.css';

export interface UnauthorizedPageProps {
    
}
 
const UnauthorizedPage: React.FC<UnauthorizedPageProps> = () => {
    return ( 
        <h1>Not Authorized!</h1>
     );
}
 
export default UnauthorizedPage;