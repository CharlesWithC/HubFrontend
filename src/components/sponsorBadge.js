import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useTranslation } from 'react-i18next';

const SponsorBadge = ({ level = undefined, vtclevel = undefined, plus = false }) => {
    const { t: tr } = useTranslation();

    const LEVEL_TEXT = { 1: tr("bronze"), 2: tr("silver"), 3: tr("gold"), 4: tr("platinum") };
    // const LEVEL_COLOR = { 1: "#cd7f32", 2: "#c0c0c0", 3: "#ffd700", 4: "#e5e4e2" };
    const VTC_LEVEL_TEXT = { 0: tr("regular_plan"), 1: tr("premium_plan"), 3: tr("special_guest") };
    const VTC_LEVEL_COLOR = { 0: "#f17b7b", 1: "#ff008b", 3: "#fff97d" };

    const navigate = useNavigate();
    if (vtclevel !== undefined) {
        return <Chip
            sx={{
                color: "#2F3136",
                bgcolor: VTC_LEVEL_COLOR[vtclevel],
                height: "20px",
                borderRadius: "5px",
                marginTop: "-3px",
                cursor: "pointer"
            }}
            label={`${VTC_LEVEL_TEXT[vtclevel]}${plus ? "+" : ""}`}
        />;
    } else if (level !== undefined) {
        return (
            <Chip
                sx={{
                    color: "#2F3136",
                    bgcolor: "#f47fff",
                    height: "20px",
                    borderRadius: "5px",
                    marginTop: "-3px",
                    cursor: "pointer"
                }}
                label={`${LEVEL_TEXT[level]}${plus ? "+" : ""}`}
                onClick={() => { navigate("/sponsor"); }}
            />
        );
    }
};

export default SponsorBadge;