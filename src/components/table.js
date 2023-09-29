import React, { useState } from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, TablePagination, Typography, Menu } from '@mui/material';

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

    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });

    const handleContextMenu = (e, row_idx) => {
        e.preventDefault();
        e.stopPropagation();
        if (anchorPosition[row_idx]) {
            setAnchorPosition({});
            return;
        }
        setAnchorPosition({ [row_idx]: { top: e.clientY, left: e.clientX } });
    };

    const handleCloseMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPosition({});
    };

    return (
        <Card className="PaperShadow" sx={style} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <TableContainer>
                <Table>
                    <TableHead key={`table-head`}>
                        <TableRow key={`row-head`}>
                            {columns.map((column, idx) => (
                                <TableCell key={`cell-${idx}`}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody key={`table-body`}>
                        {data.map((row, row_idx) => (
                            <TableRow key={`row-${row_idx}`} onClick={() => { if (onRowClick === undefined || onRowClick === null) return; onRowClick(row); }} onContextMenu={(e) => handleContextMenu(e, row_idx)} hover style={(onRowClick !== undefined && onRowClick !== null) ? { cursor: 'pointer' } : {}}>
                                {columns.map((column, col_idx) => (
                                    <TableCell key={`${row_idx}-${col_idx}`}>{row[column.id]}</TableCell>
                                ))}
                                {row.contextMenu !== null && row.contextMenu !== undefined && anchorPosition[row_idx] !== undefined && <Menu
                                    anchorReference="anchorPosition"
                                    anchorPosition={anchorPosition[row_idx]}
                                    open={anchorPosition[row_idx] !== undefined}
                                    onClose={handleCloseMenu}
                                >
                                    {row.contextMenu}
                                </Menu>}
                            </TableRow>
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