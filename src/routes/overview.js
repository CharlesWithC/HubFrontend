import StatCard from '../components/statcard';
import { Grid } from '@mui/material';

function Overview() {
    return (<Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard />
        </Grid>
    </Grid>);
}

export default Overview;