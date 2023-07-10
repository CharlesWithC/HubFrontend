import React from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, TablePagination, Typography } from '@mui/material';

const ClickableTableRow = ({ rowKey, rowMeta, children, onClick }) => {
    const handleClick = () => {
        onClick(rowMeta);
    };

    return (
        <TableRow key={rowKey} onClick={handleClick} hover style={{ cursor: 'pointer' }}>
            {children}
        </TableRow>
    );
};

const CustomTable = ({ columns, name, data, totalItems, rowsPerPageOptions, defaultRowsPerPage, onPageChange, onRowsPerPageChange, onRowClick, style, pstyle }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value);
        setRowsPerPage(newRowsPerPage);
        onRowsPerPageChange(newRowsPerPage);
    };

    return (
        <Card className="PaperShadow" sx={style}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow key="head">
                            {columns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, row_idx) => (
                            <ClickableTableRow rowKey={row_idx} rowMeta={row} onClick={onRowClick}>
                                {columns.map((column, col_idx) => (
                                    <TableCell key={`${row_idx}-${col_idx}`}>{row[column.id]}</TableCell>
                                ))}
                            </ClickableTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {name !== undefined && <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="div" style={{ marginLeft: "10px", marginRight: 'auto' }}>
                    {name}
                </Typography>
                <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={totalItems}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={pstyle}
                />
            </div>}
            {name === undefined && <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={pstyle}
            />}
        </Card>
    );
};

export default CustomTable;