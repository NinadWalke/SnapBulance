import * as React from 'react';

export interface FooterProps {}
 
const Footer: React.FC<FooterProps> = () => {
    return ( 
        <footer style={{ padding: '1rem', borderTop: '1px solid #ccc', marginTop: 'auto', textAlign: 'center', background: '#f9f9f9' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                &copy; {new Date().getFullYear()} SnapBulance Project.
            </p>
        </footer>
     );
}
 
export default Footer;