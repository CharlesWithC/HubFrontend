import React from 'react';
import { Modal, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Button, IconButton } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import SimpleBar from 'simplebar-react';

import { useTranslation } from 'react-i18next';

const ListModal = ({ title, items, data, additionalContent, open, onClose }) => {
    const { t: tr } = useTranslation();

    const modalStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const paperStyle = {
        width: 400,
        padding: '16px',
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} style={modalStyle}>
            <Paper style={paperStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Typography variant="h6">{title}</Typography>
                    <IconButton style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={handleClose}>
                        <CloseRounded />
                    </IconButton>
                </div>
                <SimpleBar style={{ maxHeight: "60vh" }}>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {items.map((item, index) => {
                                    if (item.name === undefined) return <TableRow key={index}><TableCell sx={{ padding: '8px' }}>&nbsp;</TableCell><TableCell sx={{ padding: '8px' }}>&nbsp;</TableCell></TableRow>;
                                    const value = item.value !== undefined ? item.value : item.key ? item.key.split('.').reduce((acc, curr) => (acc ? acc[curr] : ''), data) : '';
                                    return (
                                        <TableRow key={index}>
                                            <TableCell sx={{ padding: '8px' }}><b>{item.name}</b></TableCell>
                                            <TableCell sx={{ padding: '8px' }}>{value}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {additionalContent !== undefined ? additionalContent : <></>}
                </SimpleBar>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Button variant="contained" color="secondary" sx={{ ml: 'auto' }}
                        onClick={handleClose}>{tr("close")}</Button>
                </div>
            </Paper>
        </Modal>
    );
};

export default ListModal;
