import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

const Delivery = () => {
    const { logid } = useParams();

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4">#{logid}</Typography>
            <Typography variant="h4">Driver</Typography>
        </div>
    );
};

export default Delivery;