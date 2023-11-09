import { useState, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, TextField, RadioGroup, FormControl, FormLabel, FormControlLabel, MenuItem, Radio, Checkbox, Button, Box, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { customAxios as axios, getAuthToken } from '../functions';
import { useTheme } from '@emotion/react';

var vars = require("../variables");

// [
//     {
//         "type": "info",
//         "text": "Some additional information..."
//     },
//     {
//         "type": "text",
//         "label": "Name",
//         "min_length": 150
//     },
//     {
//         "type": "textarea",
//         "label": "Bio",
//         "min_length": 150
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

const CustomForm = ({ theme, config, formData, setFormData, setSubmitDisabled }) => {
    if (config === undefined) return <Typography>Please select the type of application in the dropdown on the top-right corner</Typography>;

    let fieldReq = {};
    let defaultResp = {};
    for (let i = 0; i < config.length; i++) {
        if (config[i].type !== "info") {
            defaultResp[config[i].label] = "";
            if (["text", "textarea"].includes(config[i].type)) {
                fieldReq[config[i].label] = { ...fieldReq[config[i].label], min_length: config[i].min_length };
            }
            if (["text", "textarea", "date", "datetime", "number", "dropdown", "radio", "checkbox"].includes(config[i].type)) {
                fieldReq[config[i].label] = { ...fieldReq[config[i].label], must_input: config[i].must_input };
            }
            if (["number"].includes(config[i].type)) {
                fieldReq[config[i].label] = { ...fieldReq[config[i].label], min_value: config[i].min_value, max_value: config[i].max_value };
            }

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
                config[i].choices = [];
            }
        }
    }
    if (formData === null) {
        setFormData(defaultResp);
        formData = defaultResp;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(data => ({ ...data, [name]: value }));
        const newFormData = { ...formData, [name]: value };
        const formKeys = Object.keys(newFormData);
        let allOk = true;
        for (let i = 0; i < formKeys.length; i++) {
            if (fieldReq[formKeys[i]] !== undefined) {
                if (fieldReq[formKeys[i]].min_length !== undefined) {
                    if (newFormData[formKeys[i]].length < fieldReq[formKeys[i]].min_length) {
                        setSubmitDisabled(true);
                        allOk = false;
                    }
                }
                if (fieldReq[formKeys[i]].must_input === true) {
                    if (newFormData[formKeys[i]] === undefined || newFormData[formKeys[i]].replaceAll(" ", "") === "") {
                        setSubmitDisabled(true);
                        allOk = false;
                    }
                }
                if (fieldReq[formKeys[i]].min_value !== undefined) {
                    if (newFormData[formKeys[i]] < fieldReq[formKeys[i]].min_value) {
                        setSubmitDisabled(true);
                        allOk = false;
                    }
                }
                if (fieldReq[formKeys[i]].max_value !== undefined) {
                    if (newFormData[formKeys[i]] > fieldReq[formKeys[i]].max_value) {
                        setSubmitDisabled(true);
                        allOk = false;
                    }
                }
            }
        }
        if (allOk) setSubmitDisabled(false);
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
                                    sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                    error={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length}
                                    helperText={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length ? "Input at least 150 characters" : ""}
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
                                    sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                    error={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length}
                                    helperText={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length ? "Input at least 150 characters" : ""}
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
                                    onChange={(e) => { if (!isNaN(e.target.value)) handleChange(e); }}
                                    type="text"
                                    sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                    error={field.min_value !== undefined && formData[field.label] < field.min_value || field.max_value !== undefined && formData[field.label] > field.max_value}
                                    helperText={field.min_value !== undefined && formData[field.label] < field.min_value ? `Minimum value ${field.min_value}` : (field.max_value !== undefined && formData[field.label] < field.max_value ? `Maximum value ${field.max_value}` : "")}
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
                                <TextField select
                                    label={field.label}
                                    key={field.label}
                                    name={field.label}
                                    value={formData[field.label]}
                                    onChange={handleChange}
                                    sx={{ marginTop: "6px", height: "30px" }}
                                    size="small" fullWidth
                                >
                                    {field.choices.map(choice => (
                                        <MenuItem key={choice} value={choice}>{choice}</MenuItem>
                                    ))}
                                </TextField>
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
    // FOR LOCAL TESTING PURPOSE
    if (window.location.pathname === "localhost") {
        applicationTypes = [
            {
                "id": 1,
                "name": "Driver",
                "form": [
                    {
                        "type": "date",
                        "label": "What is your birthday?",
                        "must_input": true
                    },
                    {
                        "type": "textarea",
                        "label": "How did you find us?",
                        "rows": "3",
                        "placeholder": "Enter a short answer",
                        "min_length": 150
                    },
                    {
                        "type": "radio",
                        "label": "Are you currently in another VTC?",
                        "choices": [
                            "Yes",
                            "No"
                        ],
                        "must_input": true
                    },
                    {
                        "type": "textarea",
                        "label": "What are your interests?",
                        "rows": "5",
                        "placeholder": "Tell us a little bit about yourself",
                        "min_length": 150
                    },
                    {
                        "type": "textarea",
                        "label": "Why do you want to be a part of our VTC?",
                        "rows": "5",
                        "placeholder": "Why would you like to join us? This doesn't need to be complicated.",
                        "min_length": 150
                    },
                    {
                        "type": "checkbox",
                        "label": "By joining the VTC, you agree to follow both discord and VTC rules at all times? Do you agree to our terms?",
                        "must_input": true
                    }
                ]
            },
            {
                "id": 2,
                "name": "Staff",
                "form": [
                    {
                        "type": "date",
                        "label": "What is your birthdate?"
                    },
                    {
                        "type": "textarea",
                        "label": "What country do you live in? Also include your Time Zone",
                        "placeholder": "US, Canada, UK, etc",
                        "rows": "3",
                        "min_length": 150
                    },
                    {
                        "type": "dropdown",
                        "label": "Which position are your applying for?",
                        "choices": [
                            "Events Team"
                        ],
                        "must_input": true
                    },
                    {
                        "type": "textarea",
                        "label": "Please provide a summary about yourself.",
                        "placeholder": "You may include hobbies, work positions, or any unique facts about yourself!",
                        "rows": "5",
                        "min_length": 150
                    },
                    {
                        "type": "textarea",
                        "label": "Why are you interested in joining the position you are applying for? What do you want to achieve?",
                        "placeholder": "Explain why does that position interest you and what do you want to achieve.",
                        "rows": "5",
                        "min_length": 150
                    },
                    {
                        "type": "textarea",
                        "label": "Do you have a lot of time to dedicate to this position?",
                        "placeholder": "Explain your time availability.",
                        "rows": "3",
                        "min_length": 150
                    },
                    {
                        "type": "checkbox",
                        "label": "By joining the VTC, you agree to follow both discord and VTC rules at all times? Do you agree to our terms?",
                        "must_input": true
                    }
                ]
            },
            {
                "id": 3,
                "name": "LOA",
                "form": [
                    {
                        "type": "date",
                        "label": "Start Date"
                    },
                    {
                        "type": "date",
                        "label": "End Date"
                    },
                    {
                        "type": "textarea",
                        "label": "Reason for LOA",
                        "rows": "3",
                        "min_length": 150
                    },
                    {
                        "type": "checkbox",
                        "label": "I will leave the staff position"
                    },
                    {
                        "type": "checkbox",
                        "label": "I will leave the VTC"
                    }
                ]
            },
            {
                "id": 4,
                "name": "Division"
            }
        ];
    }

    const theme = useTheme();
    const [selectedType, setSelectedType] = useState(null);
    const listTypes = Object.values(vars.applicationTypes);
    const [enableNotifications, setEnableNotifications] = useState(true);
    const [submitDisabled, setSubmitDisabled] = useState(true);

    const [formData, setFormData] = useState(null);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitDisabled(true);

        let modFormData = formData;
        let keys = Object.keys(modFormData);
        for (let i = 0; i < keys.length; i++) {
            if (modFormData[keys[i]] instanceof Array) {
                modFormData[keys[i]] = modFormData[keys[i]].join(", ");
            }
        }

        if (enableNotifications) {
            await axios({ url: `${vars.dhpath}/user/notification/settings/discord/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            await axios({ url: `${vars.dhpath}/user/notification/settings/application/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        }

        let resp = await axios({ url: `${vars.dhpath}/applications`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "type": selectedType, "application": modFormData } });
        if (resp.status === 200) {
            setSnackbarContent("Application submitted!");
            setSnackbarSeverity("success");
            setFormData(null);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setSubmitDisabled(false);
    }, [enableNotifications, formData, selectedType]);

    return <Card sx={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
                New Application
            </Typography>
            <TextField select
                key="Application Type"
                name="Application Type"
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setFormData(null); }}
                sx={{ marginTop: "6px", height: "30px" }}
                size="small"
            >
                {listTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
            </TextField>
        </div>
        <CardContent>
            <CustomForm theme={theme} config={selectedType !== null ? vars.applicationTypes[selectedType].form : undefined} formData={formData} setFormData={setFormData} setSubmitDisabled={setSubmitDisabled} />
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
                        <Button onClick={handleSubmit} variant="contained" color="info" disabled={submitDisabled}>
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