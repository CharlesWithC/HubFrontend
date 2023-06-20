import React from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, TablePagination } from '@mui/material';

const ClickableTableRow = ({ key, rowMeta, children, onClick }) => {
    const handleClick = () => {
        onClick(rowMeta);
    };

    return (
        <TableRow key={key} onClick={handleClick} hover style={{ cursor: 'pointer' }}>
            {children}
        </TableRow>
    );
};

const CustomTable = ({ columns, data, totalItems, rowsPerPageOptions, defaultRowsPerPage, onPageChange, onRowsPerPageChange, onRowClick }) => {
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
        <Card className="PaperShadow">
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <ClickableTableRow key={row.id} rowMeta={row} onClick={onRowClick}>
                                {columns.map((column) => (
                                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                                ))}
                            </ClickableTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card>
    );
};

export default CustomTable;