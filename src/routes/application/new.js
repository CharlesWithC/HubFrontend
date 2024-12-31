import { useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context';

import { Grid, Card, CardContent, Typography, TextField, RadioGroup, FormControl, FormLabel, FormControlLabel, MenuItem, Radio, Checkbox, Button, Box, Snackbar, Alert, useTheme } from '@mui/material';
import { Portal } from '@mui/base';

import { customAxios as axios, getAuthToken } from '../../functions';

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
    const { t: tr } = useTranslation();

    const fieldReq = useMemo(() => {
        if (config === undefined) return undefined;

        let ret = {};
        for (let i = 0; i < config.length; i++) {
            if (config[i].type !== "info") {
                if (config[i].x_must_be !== undefined && config[i].x_must_be.label !== undefined && config[i].x_must_be.value !== undefined && config[i].x_must_be.label !== "" && config[i].x_must_be.value !== "") {
                    ret[config[i].label] = { ...ret[config[i].label], x_must_be: config[i].x_must_be };
                }
                if (["text", "textarea"].includes(config[i].type)) {
                    ret[config[i].label] = { ...ret[config[i].label], min_length: config[i].min_length };
                }
                if (["text", "textarea", "date", "datetime", "number", "dropdown", "radio", "checkbox"].includes(config[i].type)) {
                    ret[config[i].label] = { ...ret[config[i].label], must_input: config[i].must_input };
                }
                if (["number"].includes(config[i].type)) {
                    ret[config[i].label] = { ...ret[config[i].label], min_value: config[i].min_value, max_value: config[i].max_value };
                }
            }
        }
        return ret;
    }, [config]);

    const defaultResp = useMemo(() => {
        if (config === undefined) return undefined;

        let ret = {};
        for (let i = 0; i < config.length; i++) {
            if (config[i].type !== "info") {
                ret[config[i].label] = "";

                if (config[i].type === "date") {
                    ret[config[i].label] = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                }
                else if (config[i].type === "datetime") {
                    ret[config[i].label] = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                } else if (config[i].type === "checkbox") {
                    if (config[i].choices !== undefined && config[i].choices.length !== 0) {
                        ret[config[i].label] = [];
                    } else {
                        ret[config[i].label] = tr("no");
                    }
                }
            }
        }
        return ret;
    }, [config]);

    useEffect(() => {
        if (formData === null) {
            setFormData(defaultResp);
        }
    }, [formData, defaultResp]);

    useEffect(() => {
        // this checks x_must_be and updates form data to make sure unnecessary fields get deleted in response
        // (those unnecessary fields are not rendered and would likely to be in an empty state)

        if (config === undefined || formData === null) return;

        // update form data to remove fields that are not shown
        let modified = false;
        let newFormData = {}; // we set it to empty and redo it - so questions are kept in correct order

        let toDelete = [], toAdd = [];
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (formData[field.label] !== undefined) {
                // copy based on order
                newFormData[field.label] = formData[field.label];
            }
            if (field.x_must_be !== undefined) {
                if (formData[field.x_must_be.label] !== field.x_must_be.value) {
                    toDelete.push(field.label);
                } else if (formData[field.label] === undefined) {
                    newFormData[field.label] = ""; // add here directly
                    toAdd.push(field.label); // no effect - just for calculating "toDelete"
                    modified = true;
                }
            }
        }

        toDelete = toDelete.reduce((acc, cur) => { return (!toAdd.includes(cur) ? [...acc, cur] : acc); }, []);

        for (let i = 0; i < toDelete.length; i++) {
            if (formData[toDelete[i]] !== undefined) {
                delete newFormData[toDelete[i]];
                modified = true;
            }
        }

        if (modified) {
            setSubmitDisabled(true);
            setFormData(newFormData);
        }
    }, [formData, config]);

    const handleChange = useCallback((e) => {
        // this handles changes on user input, but this does not check condition of whether the response should be recorded
        // aka this does not check x_must_be to filter response fields

        const { name, value } = e.target;
        setFormData(data => {
            // first calculate submit-disabled, then write data
            const newFormData = { ...data, [name]: value };
            const formKeys = Object.keys(newFormData);
            let allOk = true;
            for (let i = 0; i < formKeys.length; i++) {
                // double check if field is shown (this should be handled by form composition though)
                let field = fieldReq[formKeys[i]];
                if (field !== undefined) {
                    if (field.must_input === true) { // check input, so it may be undefined (though it shouldn't happen)
                        if (newFormData[formKeys[i]] === undefined || newFormData[formKeys[i]].replaceAll(" ", "") === "") {
                            setSubmitDisabled(true);
                            allOk = false;
                            break;
                        }
                    }
                    if (newFormData[formKeys[i]] !== undefined) { // ensure it's not undefined for length/value check
                        if (field.min_length !== undefined) {
                            if (newFormData[formKeys[i]].length < field.min_length) {
                                setSubmitDisabled(true);
                                allOk = false;
                                break;
                            }
                        }
                        if (field.min_value !== undefined) {
                            if (newFormData[formKeys[i]] < field.min_value) {
                                setSubmitDisabled(true);
                                allOk = false;
                                break;
                            }
                        }
                        if (field.max_value !== undefined) {
                            if (newFormData[formKeys[i]] > field.max_value) {
                                setSubmitDisabled(true);
                                allOk = false;
                                break;
                            }
                        }
                    }
                }
            }
            if (allOk) setSubmitDisabled(false);

            return { ...data, [name]: value };
        });
    }, [fieldReq]);

    const handleCheckboxChange = useCallback((choice, fieldLabel) => {
        setFormData(prev => {
            let updated = [...prev[fieldLabel]];
            if (updated.includes(choice)) {
                updated.splice(updated.indexOf(choice), 1);
            } else {
                updated.push(choice);
            }

            return {
                ...prev,
                [fieldLabel]: updated
            };
        });
    }, []);

    const handleCheckboxYNChange = useCallback((fieldLabel) => {
        setFormData(prev => {
            let updated = prev[fieldLabel];
            if (updated === tr("yes")) {
                updated = tr("no");
            } else {
                updated = tr("yes");
            }

            return {
                ...prev,
                [fieldLabel]: updated
            };
        });
    }, []);

    if (config === undefined) return <Typography>{tr("select_application_type")}</Typography>;

    return (
        <form>
            {formData !== null && <Grid container spacing={2}>
                {config.map(field => {
                    if (field.x_must_be !== undefined) {
                        if (formData[field.x_must_be.label] !== field.x_must_be.value) {
                            return <></>;
                        }
                    }
                    let ret = <></>;
                    if (formData[field.label] === undefined) formData[field.label] = "";
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
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        key={field.label}
                                        name={field.label}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                        error={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length}
                                        helperText={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length ? tr("input_at_least", { value: field.min_length }) : ""}
                                    />
                                </>
                            );
                            break;

                        case 'textarea':
                            ret = (
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        multiline
                                        key={field.label}
                                        name={field.label}
                                        onChange={handleChange}
                                        rows={field.rows}
                                        placeholder={field.placeholder}
                                        sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                        error={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length}
                                        helperText={field.min_length !== undefined && formData[field.label] !== "" && formData[field.label].length <= field.min_length ? `Input at least ${field.min_length} characters` : ""}
                                        InputProps={{
                                            inputComponent: 'textarea',
                                            inputProps: {
                                                style: {
                                                    resize: 'vertical',
                                                    overflow: 'auto'
                                                }
                                            }
                                        }}
                                    />
                                </>
                            );
                            break;

                        case 'number':
                            ret = (
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        key={field.label}
                                        name={field.label}
                                        onChange={(e) => { if (!isNaN(e.target.value)) handleChange(e); }}
                                        type="text"
                                        sx={{ width: "100%", '& .MuiFormHelperText-root': { color: theme.palette.error.main } }}
                                        error={field.min_value !== undefined && formData[field.label] < field.min_value || field.max_value !== undefined && formData[field.label] > field.max_value}
                                        helperText={field.min_value !== undefined && formData[field.label] < field.min_value ? `Minimum value ${field.min_value}` : (field.max_value !== undefined && formData[field.label] < field.max_value ? `Maximum value ${field.max_value}` : "")}
                                    />
                                </>
                            );
                            break;

                        case 'date':
                            ret = (
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        key={field.label}
                                        name={field.label}
                                        onChange={handleChange}
                                        type="date"
                                    />
                                </>
                            );
                            break;

                        case 'datetime':
                            ret = (
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        key={field.label}
                                        name={field.label}
                                        onChange={handleChange}
                                        type="datetime-local"
                                    />
                                </>
                            );
                            break;

                        case 'dropdown':
                            ret = (
                                <>
                                    <Typography variant="body2" sx={{ mb: "5px" }}>
                                        {field.label}
                                    </Typography>
                                    <TextField select
                                        key={field.label}
                                        name={field.label}
                                        value={formData[field.label]}
                                        onChange={handleChange}
                                        size="small" fullWidth
                                    >
                                        {field.choices.map(choice => (
                                            <MenuItem key={choice} value={choice}>{choice}</MenuItem>
                                        ))}
                                    </TextField>
                                </>
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
                            if (field.choices !== undefined && field.choices.length !== 0) {
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
                                                    checked={formData[field.label] === tr("yes")}
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
            </Grid>}
        </form>
    );
};

const NewApplication = () => {
    const { t: tr } = useTranslation();
    const { apiPath, applicationTypes, loadApplicationTypes } = useContext(AppContext);

    const theme = useTheme();
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [enableNotifications, setEnableNotifications] = useState(true);
    const [submitDisabled, setSubmitDisabled] = useState(true);

    const [formData, setFormData] = useState(null);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const modifiedConfig = useMemo(() => {
        // just to fix the legacy "position" type
        if (selectedType === null) return null;
        let config = applicationTypes[selectedType].form;
        if (config) {
            for (let i = 0; i < config.length; i++) {
                if (config[i].type === "position") {
                    config[i].type = "dropdown";
                    config[i].choices = [];
                }
            }
        }
        return config;
    }, [selectedType, applicationTypes]);

    useEffect(() => {
        async function doLoad() {
            if (applicationTypes === null) {
                window.loading += 1;
                await loadApplicationTypes();
                window.loading -= 1;
            }
        }
        doLoad();
    }, []); // do not include applicationTypes to prevent rerender loop on network error

    const handleSubmit = useCallback(async () => {
        setSubmitDisabled(true);

        let modFormData = { ...formData };
        let keys = Object.keys(modFormData);
        for (let i = 0; i < keys.length; i++) {
            if (modFormData[keys[i]] instanceof Array) {
                modFormData[keys[i]] = modFormData[keys[i]].join(", ");
            }
            if (modFormData[keys[i]] === undefined) {
                delete modFormData[keys[i]];
            }
        }

        if (enableNotifications) {
            await axios({ url: `${apiPath}/user/notification/settings/discord/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            await axios({ url: `${apiPath}/user/notification/settings/application/enable`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        }

        let resp = await axios({ url: `${apiPath}/applications`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: { "type": selectedType, "application": modFormData } });
        if (resp.status === 200) {
            setSnackbarContent(tr("application_submitted"));
            setSnackbarSeverity("success");
            setFormData(null);
            navigate("/application/my");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setSubmitDisabled(false);
    }, [apiPath, enableNotifications, formData, selectedType]);

    return <Card sx={{ padding: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>{tr("new_application")}</Typography>
            {applicationTypes !== null && <TextField select
                key={tr("application_type")}
                name={tr("application_type")}
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setSubmitDisabled(true); setFormData(null); }}
                sx={{ marginTop: "6px", height: "30px" }}
                size="small"
            >
                {Object.values(applicationTypes).map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
            </TextField>}
        </div>
        {applicationTypes !== null && <CardContent>
            <CustomForm theme={theme} config={selectedType !== null ? modifiedConfig : undefined} formData={formData} setFormData={setFormData} setSubmitDisabled={setSubmitDisabled} />
            {((selectedType !== null ? applicationTypes[selectedType].form : undefined) !== undefined) &&
                <Box sx={{ display: 'grid', justifyItems: 'end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl component="fieldset">
                            <FormControlLabel
                                key="enable-notifications"
                                control={
                                    <Checkbox
                                        name={tr("enable_notifications")}
                                        checked={enableNotifications}
                                        onChange={() => setEnableNotifications(!enableNotifications)}
                                    />
                                }
                                label={tr("enable_notifications")}
                            />
                        </FormControl>
                        <Button onClick={handleSubmit} variant="contained" color="info" disabled={submitDisabled}>{tr("submit")}</Button>
                    </div>
                </Box>}
        </CardContent>}
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