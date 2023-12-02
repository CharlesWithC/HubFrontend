import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const { t: tr } = useTranslation();
    
    const navigate = useNavigate();
    return (
        <Card sx={{ width: 350, position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>{tr("not_found")}</h2>
                <div><p>{tr("dont_go_over_the_road_blockers")}</p></div>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={() => { navigate("/"); }}>{tr("back_to_home")}</Button>
            </CardActions>
        </Card>
    );
};

export default NotFound;