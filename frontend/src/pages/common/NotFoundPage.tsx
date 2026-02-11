import * as React from 'react';
import { Link } from 'react-router-dom';

export interface NotFoundPageProps {}
 
const NotFoundPage: React.FC<NotFoundPageProps> = () => {
    return ( 
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', margin: 0 }}>404 😕</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            
            <Link to="/">
                <button style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Go Back Home
                </button>
            </Link>
        </div>
     );
}
 
export default NotFoundPage;