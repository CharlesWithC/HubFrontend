import { Card, CardContent, CardActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <Card sx={{ width: 350, position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>Not Found</h2>
                <div><p>Don't go over the road blockers!</p></div>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={() => { navigate("/"); }}>Back to home</Button>
            </CardActions>
        </Card>
    );
};

export default NotFound;