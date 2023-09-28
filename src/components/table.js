import React, { useState } from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, TablePagination, Typography, Menu } from '@mui/material';

const ClickableTableRow = ({ rowKey, rowMeta, children, onClick, onContextMenu }) => {
    const handleClick = () => {
        if (onClick === undefined || onClick === null) return;
        onClick(rowMeta);
    };

    return (
        <TableRow key={rowKey} onClick={handleClick} onContextMenu={onContextMenu} hover style={{ cursor: 'pointer' }}>
            {children}
        </TableRow>
    );
};

const CustomTable = ({ columns, name, data, totalItems, rowsPerPageOptions, defaultRowsPerPage, onPageChange, onRowsPerPageChange, onRowClick, hasContextMenu, style, pstyle }) => {
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

    const [anchorPosition, setAnchorPosition] = useState({});

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
                    <TableHead>
                        <TableRow key="head">
                            {columns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, row_idx) => (
                            <>
                                <ClickableTableRow rowKey={row_idx} rowMeta={row} onClick={onRowClick} onContextMenu={(e) => handleContextMenu(e, row_idx)}>
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
                                </ClickableTableRow>
                            </>
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