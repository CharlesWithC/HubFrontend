import React, { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, CardContent, TablePagination, Typography, Menu, TextField } from '@mui/material';

const CustomTable = ({ columns, name, nameRight, data, totalItems, rowsPerPageOptions, defaultRowsPerPage, onPageChange, onRowsPerPageChange, onRowClick, onSearch, searchHint, searchUpdateInterval, searchWidth, style, pstyle }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

    if (searchUpdateInterval === undefined) searchUpdateInterval = 100;
    if (searchWidth === undefined) searchWidth = "300px";
    const [searchContent, setSearchContent] = useState("");
    const [searchContentLU, setSearchConentLU] = useState("");
    const [searchLastUpdate, setSearchLastUpdate] = useState(0);
    useEffect(() => {
        let interval = null;

        if (onSearch !== undefined) {
            interval = setInterval(() => {
                if (+new Date() - searchLastUpdate >= searchUpdateInterval && searchContentLU !== searchContent) {
                    setSearchConentLU(searchContent);
                    onSearch(searchContent);
                }
            }, 50);
        }

        return () => clearInterval(interval);
    }, [searchContent, searchContentLU]);

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

    const [touchStart, setTouchStart] = useState(null);
    const handleTouchStart = () => {
        setTouchStart(+new Date());
    };
    const handleTouchEnd = (e, row_idx) => {
        if (+new Date() - touchStart >= 1000) {
            handleContextMenu(e, row_idx);
        }
    };

    return (
        <Card className="PaperShadow" sx={style} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <CardContent sx={name === undefined ? { p: 0 } : {}} style={{ paddingBottom: 0 }}>
                {name !== undefined &&
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center', marginLeft: "10px", marginRight: 'auto', fontWeight: 800 }}>
                            {name}
                        </Typography>
                        {onSearch !== undefined && <TextField
                            label={searchHint}
                            value={searchContent}
                            onChange={(e) => { setSearchContent(e.target.value); setSearchLastUpdate(+new Date()); }}
                            sx={{ width: searchWidth }}
                            size="small"
                        />}
                        {nameRight !== undefined && <>
                            <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
                                {nameRight}
                            </Typography>
                        </>}
                    </div>
                }
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
                                <TableRow key={`row-${row_idx}`} onClick={() => { if (onRowClick === undefined || onRowClick === null) return; onRowClick(row); }} onContextMenu={(e) => handleContextMenu(e, row_idx)} onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e, row_idx)} hover style={(onRowClick !== undefined && onRowClick !== null) ? { cursor: 'pointer' } : {}}>
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
            </CardContent>
        </Card>
    );
};

export default CustomTable;