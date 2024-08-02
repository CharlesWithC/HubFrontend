import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Card, CardContent, TablePagination, Typography, Menu, TextField } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faArrowsUpDown } from '@fortawesome/free-solid-svg-icons';

import useLongPress from './useLongPress';

const CustomTableRow = memo(({ children, onContextMenu, ...props }) => {
    const ref = useRef(null);
    if (onContextMenu) {
        useLongPress(ref, onContextMenu, 500);
    }

    return (
        <TableRow ref={ref} onContextMenu={onContextMenu} {...props}>
            {children}
        </TableRow>
    );
});

const CustomTable = ({ page: initPage, columns, orderBy, order, onOrderingUpdate, name, nameRight, data, totalItems, rowsPerPageOptions, defaultRowsPerPage, onPageChange, onRowsPerPageChange, onRowClick, onSearch, searchHint, searchUpdateInterval, searchWidth, style, pstyle }) => {
    if (onOrderingUpdate === undefined) onOrderingUpdate = function (order, order_by) { };

    const { t: tr } = useTranslation();
    const [page, setPage] = useState(initPage - 1); // page for MUI Table (from 0)
    const [inputPage, setInputPage] = useState(initPage); // page for user input (from 1)
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

    useEffect(() => {
        if (Math.ceil(totalItems / rowsPerPage) !== 0 && page > Math.ceil(totalItems / rowsPerPage)) {
            setPage(Math.ceil(totalItems / rowsPerPage));
        }
        if (Math.ceil(totalItems / rowsPerPage) !== 0 && inputPage > Math.ceil(totalItems / rowsPerPage)) {
            setInputPage(Math.ceil(totalItems / rowsPerPage));
        }
    }, [page, inputPage, totalItems, rowsPerPage]);

    const debouncedHandlePageChange = debounce((page) => {
        onPageChange(page);
    }, 200);

    const handleInputPage = useCallback((event) => {
        let newPage = event.target.value;
        if (isNaN(newPage) || newPage === "")
            newPage = 1;
        if (newPage < 1) newPage = 1;
        if (newPage > Math.ceil(totalItems / rowsPerPage)) newPage = Math.ceil(totalItems / rowsPerPage);

        setPage(newPage - 1);
        setInputPage(newPage);
        debouncedHandlePageChange(newPage);
    }, []);

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

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
        setInputPage(newPage + 1);
        debouncedHandlePageChange(newPage + 1);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        const newRowsPerPage = parseInt(event.target.value);
        setRowsPerPage(newRowsPerPage);
        onRowsPerPageChange(newRowsPerPage);
    }, []);

    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });

    const handleContextMenu = useCallback((e, row_idx) => {
        e.preventDefault();
        if (e.stopPropagation !== undefined) e.stopPropagation();
        if (anchorPosition[row_idx]) {
            setAnchorPosition({});
            return;
        }
        setAnchorPosition({ [row_idx]: { top: e.clientY !== undefined ? e.clientY : e.center.y, left: e.clientX !== undefined ? e.clientX : e.center.x } });
    }, []);

    const handleCloseMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPosition({});
    }, []);

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
                            <CustomTableRow key={`row-head`}>
                                {columns.map((column, idx) => (
                                    <TableCell key={`cell-${idx}`} onClick={(e) => { e.preventDefault(); column.orderKey !== undefined ? (column.orderKey !== orderBy ? onOrderingUpdate(column.orderKey, column.defaultOrder) : (column.orderKey === orderBy && order === "asc" ? onOrderingUpdate(column.orderKey, "desc") : onOrderingUpdate(column.orderKey, "asc"))) : undefined; }} sx={column.orderKey !== undefined ? { cursor: "pointer" } : {}}>
                                        {column.label}
                                        {column.orderKey !== undefined && <>&nbsp;
                                            {column.orderKey !== orderBy && <FontAwesomeIcon onClick={() => onOrderingUpdate(column.orderKey, column.defaultOrder)} icon={faArrowsUpDown} style={{ opacity: 0.5, cursor: "pointer" }} />}
                                            {column.orderKey === orderBy && order === "asc" && (!column.reversedOrder ? <FontAwesomeIcon onClick={() => onOrderingUpdate(column.orderKey, "desc")} icon={faArrowUp} style={{ cursor: "pointer" }} /> : <FontAwesomeIcon onClick={() => onOrderingUpdate(column.orderKey, "asc")} icon={faArrowDown} style={{ cursor: "pointer" }} />)}
                                            {column.orderKey === orderBy && order === "desc" && (!column.reversedOrder ? <FontAwesomeIcon onClick={() => onOrderingUpdate(column.orderKey, "asc")} icon={faArrowDown} style={{ cursor: "pointer" }} /> : <FontAwesomeIcon onClick={() => onOrderingUpdate(column.orderKey, "desc")} icon={faArrowUp} style={{ cursor: "pointer" }} />)}
                                        </>}
                                    </TableCell>
                                ))}
                            </CustomTableRow>
                        </TableHead>
                        <TableBody key={`table-body`}>
                            {data.map((row, row_idx) => (
                                <CustomTableRow key={`row-${row_idx}`} onClick={() => { if (onRowClick === undefined || onRowClick === null) return; onRowClick(row); }} onContextMenu={(e) => handleContextMenu(e, row_idx)} hover style={(onRowClick !== undefined && onRowClick !== null) ? { cursor: 'pointer' } : {}}>
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
                                </CustomTableRow>
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
                    labelRowsPerPage={tr("rows_per_page")}
                    sx={pstyle}
                    labelDisplayedRows={({ from, to, count }) => (<div>
                        {tr("page")}
                        <TextField
                            value={inputPage}
                            onChange={handleInputPage}
                            size="small" variant="standard"
                            sx={{
                                width: '30px', margin: '0px 5px 0px 5px',
                                '& input': {
                                    padding: '0', textAlign: 'center', fontSize: "0.875rem"
                                },
                                '&:not(:focus-within) .MuiInput-underline:before': {
                                    display: 'none'
                                },
                                '&:not(:focus-within) .MuiInput-underline:after': {
                                    display: 'none'
                                },
                                '& .MuiInput-underline.Mui-focused:after': {
                                    display: 'block',
                                    transition: 'none'
                                }
                            }}
                        />
                        / {Math.max(1, Math.ceil(count / rowsPerPage))}
                    </div>)}
                />
            </CardContent>
        </Card>
    );
};

export default CustomTable;