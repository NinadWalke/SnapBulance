import * as React from 'react';

export interface RideHistoryProps {}
 
const RideHistory: React.FC<RideHistoryProps> = () => {
    // Dummy Data
    const history = [
        { id: 1, date: '2023-10-12', dest: 'City Hospital', status: 'Completed', cost: '₹500' },
        { id: 2, date: '2023-09-05', dest: 'Apollo Clinic', status: 'Completed', cost: '₹350' },
        { id: 3, date: '2023-08-20', dest: 'Fortis ER', status: 'Cancelled', cost: '₹0' },
    ];

    return ( 
        <div style={{ padding: '2rem' }}>
            <h1>Ride History</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Date</th>
                        <th style={{ padding: '0.5rem' }}>Destination</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem' }}>Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((ride) => (
                        <tr key={ride.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '0.5rem' }}>{ride.date}</td>
                            <td style={{ padding: '0.5rem' }}>{ride.dest}</td>
                            <td style={{ padding: '0.5rem', color: ride.status === 'Cancelled' ? 'red' : 'green' }}>
                                {ride.status}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{ride.cost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
     );
}
 
export default RideHistory;