import { useState, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, TextField, Select, RadioGroup, FormControl, FormLabel, FormControlLabel, MenuItem, Radio, Checkbox, Button, Box, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { customAxios as axios, getAuthToken } from '../functions';

var vars = require("../variables");

// [
//     {
//         "type": "info",
//         "text": "Some additional information..."
//     },
//     {
//         "type": "text",
//         "label": "Name"
//     },
//     {
//         "type": "textarea",
//         "label": "Bio"
//     },
//     {
//         "type": "number",
//         "label": "Age"
//     },
//     {
//         "type": "date",
//         "label": "Start Date"
//     },
//     {
//         "type": "datetime",
//         "label": "Appointment"
//     },
//     {
//         "type": "dropdown",
//         "label": "Language",
//         "choices": ["English", "Spanish", "French"]
//     },
//     {
//         "type": "position",
//         "label": "What position are you applying for?" // this syncs to /applications/positions
//     },
//     {
//         "type": "radio",
//         "label": "Gender",
//         "choices": ["Male", "Female", "Other"]
//     },
//     {
//         "type": "checkbox",
//         "label": "Toppings",
//         "choices": ["Pepperoni", "Sausage", "Olives"]
//     }
// ];

const CustomForm = ({ config, formData, setFormData }) => {
    if (config === undefined) return <Typography>Please select an application type in the dropdown on the top-right corner</Typography>;

    let defaultResp = {};
    for (let i = 0; i < config.length; i++) {
        if (config[i].type !== "info") {
            defaultResp[config[i].label] = "";
            if (config[i].type === "date") {
                defaultResp[config[i].label] = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
            }
            else if (config[i].type === "datetime") {
                defaultResp[config[i].label] = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            } else if (config[i].type === "checkbox") {
                if (config[i].choices !== undefined) {
                    defaultResp[config[i].label] = [];
                } else {
                    defaultResp[config[i].label] = "No";
                }
            } else if (config[i].type === "position") {
                config[i].type = "dropdown";
                config[i].choices = vars.applicationPositions;
            }
        }
    }
    if (formData === null) {
        setFormData(defaultResp);
        formData = defaultResp;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(data => ({
            ...data,
            [name]: value
        }));
    };

    const handleCheckboxChange = (choice, fieldLabel) => {
        let updated = formData[fieldLabel];
        if (updated.includes(choice)) {
            updated.splice(updated.indexOf(choice), 1);
        } else {
            updated.push(choice);
        }

        setFormData(prev => ({
            ...prev,
            [fieldLabel]: updated
        }));
    };

    const handleCheckboxYNChange = (fieldLabel) => {
        let updated = formData[fieldLabel];
        if (updated === "Yes") {
            updated = "No";
        } else {
            updated = "Yes";
        }

        setFormData(prev => ({
            ...prev,
            [fieldLabel]: updated
        }));
    };

    return (
        <form>
            <Grid container spacing={2}>
                {config.map(field => {
                    let ret = <></>;
                    switch (field.type) {
                        case 'info':
                            ret = (
                                <Typography key={field.label}>
                                    {field.text}
                                </Typography>
                            );
                            break;

                        case 'text':
                            ret = (
                                <TextField
                                    key={field.label}
                                    name={field.label}
                                    label={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    sx={{ width: "100%" }}
                                />
                            );
                            break;

                        case 'textarea':
                            ret = (
                                <TextField
                                    multiline
                                    key={field.label}
                                    name={field.label}
                                    label={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    rows={field.rows}
                                    placeholder={field.placeholder}
                                    sx={{ width: "100%" }}
                                />
                            );
                            break;

                        case 'number':
                            ret = (
                                <TextField
                                    key={field.label}
                                    name={field.label}
                                    label={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    type="number"
                                    sx={{ width: "100%" }}
                                />
                            );
                            break;

                        case 'date':
                            ret = (
                                <TextField
                                    key={field.label}
                                    name={field.label}
                                    label={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    type="date"
                                />
                            );
                            break;

                        case 'datetime':
                            ret = (
                                <TextField
                                    key={field.label}
                                    name={field.label}
                                    label={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    type="datetime-local"
                                />
                            );
                            break;

                        case 'dropdown':
                            ret = (
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">{field.label}</FormLabel>
                                    <Select
                                        key={field.label}
                                        name={field.label}
                                        value={formData[field.label]}
                                        onChange={handleChange}
                                        sx={{ marginTop: "6px", height: "30px" }}
                                    >
                                        {field.choices.map(choice => (
                                            <MenuItem key={choice} value={choice}>{choice}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                            break;

                        case 'radio':
                            ret = (
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">{field.label}</FormLabel>
                                    <RadioGroup
                                        name={field.label}
                                        label={field.label}
                                        value={formData[field.label]}
                                        onChange={handleChange}
                                    >
                                        {field.choices.map(choice => (
                                            <FormControlLabel
                                                key={choice}
                                                value={choice}
                                                control={<Radio />}
                                                label={choice}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            );
                            break;

                        case 'checkbox':
                            if (field.choices !== undefined) {
                                ret = (
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">{field.label}</FormLabel>
                                        {field.choices.map(choice => (
                                            <FormControlLabel
                                                key={choice}
                                                control={
                                                    <Checkbox
                                                        name={field.label}
                                                        checked={formData[field.label].includes(choice)}
                                                        onChange={() => handleCheckboxChange(choice, field.label)}
                                                    />
                                                }
                                                label={choice}
                                            />
                                        ))}
                                    </FormControl>
                                );
                            } else {
                                ret = (
                                    <FormControl component="fieldset">
                                        <FormControlLabel
                                            key={field.label}
                                            control={
                                                <Checkbox
                                                    name={field.label}
                                                    checked={formData[field.label] === "Yes"}
                                                    onChange={() => handleCheckboxYNChange(field.label)}
                                                />
                                            }
                                            label={field.label}
                                        />
                                    </FormControl>
                                );
                            }
                            break;

                        default:
                            ret = null;
                    }
                    return <Grid item xs={12} key={field.label}>{ret}</Grid>;
                })}
            </Grid>
        </form>
    );
};

const NewApplication = () => {
    const [selectedType, setSelectedType] = useState(null);
    const listTypes = Object.values(vars.applicationTypes);
    const [enableNotifications, setEnableNotifications] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState(null);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitLoading(true);

        let modFormData = formData;
        let keys = Object.keys(modFormData);
        for (let i = 0; i < keys.length; i++) {
            if (modFormData[keys[i]] instanceof Array) {
                modFormData[keys[i]] = modFormData[keys[i]].join(", ");
            }
        }

        if (enableNotifications) {
            await axios({ url: `${vars.dhpath}/user/notification/settings/discord/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }});
            await axios({ url: `${vars.dhpath}/user/notification/settings/application/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }});
        }

        let resp = await axios({ url: `${vars.dhpath}/applications`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "application_type": selectedType, "application": modFormData } });
        if (resp.status === 200) {
            setSnackbarContent("Application submitted!");
            setSnackbarSeverity("success");
            setFormData(null);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setSubmitLoading(false);
    }, [enableNotifications, formData, selectedType]);

    return <Card sx={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                New Application
            </Typography>
            <Select
                key="Application Type"
                name="Application Type"
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setFormData(null); }}
                sx={{ marginTop: "6px", height: "30px" }}
            >
                {listTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
            </Select>
        </div>
        <CardContent>
            <CustomForm config={selectedType !== null ? vars.applicationTypes[selectedType].form : undefined} formData={formData} setFormData={setFormData} />
            {((selectedType !== null ? vars.applicationTypes[selectedType].form : undefined) !== undefined) &&
                <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl component="fieldset">
                            <FormControlLabel
                                key="enable-notifications"
                                control={
                                    <Checkbox
                                        name="Enable notifications?"
                                        checked={enableNotifications}
                                        onChange={() => setEnableNotifications(!enableNotifications)}
                                    />
                                }
                                label="Enable notifications?"
                            />
                        </FormControl>
                        <Button onClick={handleSubmit} variant="contained" color="info" disabled={submitLoading}>
                            Submit
                        </Button>
                    </div>
                </Box>}
        </CardContent>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </Card>;
};

export default NewApplication;