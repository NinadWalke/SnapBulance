import * as React from 'react';

export interface LoaderProps {}
 
const Loader: React.FC<LoaderProps> = () => {
    return ( 
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <h2>Loading... ⏳</h2>
        </div>
     );
}
 
export default Loader;