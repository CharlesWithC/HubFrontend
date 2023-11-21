import { Chip } from "@mui/material";

var vars = require("../variables");

const LEVEL_TEXT = { 1: "Bronze", 2: "Silver", 3: "Gold", 4: "Platinum" };
const LEVEL_COLOR = { 1: "#cd7f32", 2: "#c0c0c0", 3: "#ffd700", 4: "#e5e4e2" };

const SponsorBadge = ({ level }) => {
    return <Chip sx={{ color: "#2F3136", bgcolor: "#f47fff", height: "20px", borderRadius: "5px", marginTop: "-3px" }} label={LEVEL_TEXT[level]} />;
};

export default SponsorBadge;