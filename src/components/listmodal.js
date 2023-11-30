import { useTranslation } from "react-i18next";
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Button } from "@mui/material";

const ListDialog = ({ title, items, data, additionalContent, open, onClose }) => {
    const { t: tr } = useTranslation();
    const handleClose = () => {
        onClose();
    };
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                <Typography variant="h6">{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table>
                        <TableBody>
                            {items.map((item, index) => {
                                if (item.name === undefined)
                                    return (
                                        <TableRow key={index}>
                                            <TableCell
                                                sx={{
                                                    padding: "8px",
                                                }}
                                            >
                                                &nbsp;
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    padding: "8px",
                                                }}
                                            >
                                                &nbsp;
                                            </TableCell>
                                        </TableRow>
                                    );
                                const value = item.value !== undefined ? item.value : item.key ? item.key.split(".").reduce((acc, curr) => (acc ? acc[curr] : ""), data) : "";
                                return (
                                    <TableRow key={index}>
                                        <TableCell
                                            sx={{
                                                padding: "8px",
                                            }}
                                        >
                                            <b>{item.name}</b>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                padding: "8px",
                                            }}
                                        >
                                            {value}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                {additionalContent !== undefined ? additionalContent : <></>}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                        ml: "auto",
                    }}
                    onClick={handleClose}
                >
                    {tr("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ListDialog;
