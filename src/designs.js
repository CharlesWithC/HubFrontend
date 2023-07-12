export function getDesignTokens(mode) {
    return {
        typography: {
            fontFamily: 'Open Sans, sans-serif',
        },
        palette: {
            mode, ...(mode === 'light'
                ? {
                    // palette values for light mode
                    primary: {
                        main: '#fafafa',
                    },
                    background: {
                        default: '#fafafa',
                        paper: '#f0f0f0',
                    },
                    text: {
                        primary: '#3c3c3c',
                        secondary: '#606060',
                    },
                }
                : {
                    // palette values for dark mode
                    primary: {
                        main: '#2F3136'
                    },
                    secondary: {
                        main: '#212529'
                    },
                    background: {
                        default: '#2F3136',
                        paper: '#212529',
                    },
                    text: {
                        primary: '#fafafa',
                        secondary: '#efefef'
                    },
                }),
        }, components: {
            mode, ...(mode === 'light'
                ? {
                    MuiDialogTitle: {
                        styleOverrides: {
                            root: {
                                fontWeight: "800"
                            }
                        }
                    },
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: '5px',
                                '&.Mui-selected': {
                                    backgroundColor: '#afafaf',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: '#afafaf',
                                },
                            },
                        },
                    },
                    MuiTabs: {
                        styleOverrides: {
                            root: {
                                '& .Mui-selected': {
                                    color: '#2196f3',
                                    textShadow: "1px 1px 2px"
                                },
                            },
                        },
                    },
                    MuiTooltip: {
                        styleOverrides: {
                            popover: {
                                marginTop: 5,
                            },
                            arrow: {
                                marginTop: 5,
                            }
                        },
                    }
                } : {
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: '5px',
                                '&.Mui-selected': {
                                    backgroundColor: '#3F4248',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: '#3F4248',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                backgroundColor: '#111214',
                            }
                        }
                    },
                    MuiToolbar: {
                        styleOverrides: {
                            root: {
                                '& .user-profile:hover': {
                                    backgroundColor: '#3F4248',
                                },
                            },
                        },
                    },
                    MuiFormLabel: {
                        styleOverrides: {
                            root: {
                                '&.Mui-focused': {
                                    color: '#bbbbbb',
                                },
                            },
                        },
                    },
                    MuiDialogTitle: {
                        styleOverrides: {
                            root: {
                                fontWeight: "800"
                            }
                        }
                    },
                    MuiTabs: {
                        styleOverrides: {
                            root: {
                                '& .Mui-selected': {
                                    color: '#2196f3',
                                    textShadow: "0 0 1px"
                                },
                            },
                        },
                    },
                    MuiTooltip: {
                        styleOverrides: {
                            tooltip: {
                                fontSize: "16px",
                                backgroundColor: '#202225',
                            },  
                            arrow: {
                                color: '#202225',
                            }
                        },
                    }
                })
        },
    };
};