var vars = require("./variables");

export function darkenColor(hex, factor = 0.2) {
    // Ensure the factor is between 0 and 1
    const clampedFactor = Math.min(1, Math.max(0, factor));

    // Parse the hex color into RGB components
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Calculate the darkened color by reducing each RGB component
    r = Math.round(r * (1 - clampedFactor));
    g = Math.round(g * (1 - clampedFactor));
    b = Math.round(b * (1 - clampedFactor));

    // Convert back to hex format
    const darkenedHex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;

    return darkenedHex;
}

export function customSelectStyles(theme) {
    return {
        control: (base, state) => ({
            ...base,
            backgroundColor: "transparent",
            borderColor: theme.palette.text.secondary + "88",
            opacity: state.isDisabled ? 0.4 : 1
        }),
        option: (base) => ({
            ...base,
            color: '#3c3c3c'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100005,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 100005
        }),
        input: (base) => ({
            ...base,
            color: theme.palette.text.primary
        }),
        singleValue: (base) => ({
            ...base,
            color: theme.palette.text.primary
        }),
        multiValue: (base, state) => {
            return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
        },
        multiValueLabel: (base, state) => {
            return state.data.isFixed
                ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
                : base;
        },
        multiValueRemove: (base, state) => {
            return state.data.isFixed ? { ...base, display: 'none' } : base;
        }
    };
};


export function getDesignTokens(customMode, mode, use_custom_theme = false, theme_background = null, theme_main = null, darken_ratio = null, font_size = "regular") {
    if (vars.userLevel < 3) {
        use_custom_theme = false;
    }
    if (theme_background !== null && theme_main !== null && darken_ratio !== null && use_custom_theme) {
        customMode = "custom";
    }
    let bgBase = {
        light: {
            default: '#fafafa',
            paper: '#f0f0f0',
        },
        dark: {
            default: '#2F3136',
            paper: '#212529',
        },
        halloween: {
            default: '#DF5120',
            paper: '#C33922',
        },
        custom: {
            default: theme_background,
            paper: theme_main
        },
    };
    let darkenRatio = {
        light: 0.05,
        dark: 0.5,
        halloween: 0.2,
        custom: darken_ratio
    };

    let compoBase = {
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                h2: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                h3: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                h4: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                h5: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                h6: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                subtitle1: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                subtitle2: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                body1: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                body2: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                button: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                caption: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                overline: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                },
                root: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontSize: (font_size === "larger" ? "1.1em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    fontSize: (font_size === "larger" ? "1.5em" : (font_size === "smaller" ? "0.9em !important" : undefined)),
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: "800"
                }
            }
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
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '5px',
                    '&.Mui-selected': {
                        backgroundColor: darkenColor(bgBase[customMode].default, darkenRatio[customMode]),
                    },
                    '&.Mui-selected:hover': {
                        backgroundColor: darkenColor(bgBase[customMode].default, darkenRatio[customMode]),
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: bgBase[customMode].paper,
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: darkenColor(bgBase[customMode].paper, darkenRatio[customMode]),
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    '& .user-profile:hover': {
                        backgroundColor: darkenColor(bgBase[customMode].default, 0.15),
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: bgBase[customMode].paper,
                    backgroundImage: `linear-gradient(${bgBase[customMode].paper}, ${bgBase[customMode].paper})`,
                }
            }
        }
    };

    return {
        typography: {
            fontFamily: 'Open Sans, sans-serif',
        },
        darkenRatio: darkenRatio[customMode],
        palette: {
            mode, ...(mode === 'light'
                ? {
                    primary: {
                        main: '#fafafa',
                    },
                    secondary: {
                        main: '#dadada',
                    },
                    background: bgBase[customMode],
                    text: {
                        primary: '#3c3c3c',
                        secondary: '#606060',
                    },
                }
                : {
                    primary: {
                        main: '#2F3136'
                    },
                    secondary: {
                        main: '#212529'
                    },
                    background: bgBase[customMode],
                    text: {
                        primary: '#fafafa',
                        secondary: '#efefef'
                    },
                })
        }, components: {
            mode, ...(customMode === 'light'
                ? {
                    ...compoBase,
                    MuiFormLabel: {
                        styleOverrides: {
                            root: {
                                '&.Mui-focused': {
                                    color: '#606060',
                                },
                            },
                        },
                    },
                    MuiRadio: {
                        styleOverrides: {
                            root: {
                                color: '#606060',
                                '&.Mui-checked': {
                                    color: '#3c3c3c',
                                },
                            },
                        },
                    },
                    MuiCheckbox: {
                        styleOverrides: {
                            root: {
                                color: '#606060',
                                '&.Mui-checked': {
                                    color: '#3c3c3c',
                                },
                            },
                        },
                    },
                } : {
                    ...compoBase,
                    MuiFormLabel: {
                        styleOverrides: {
                            root: {
                                '&.Mui-focused': {
                                    color: '#bbbbbb',
                                },
                            },
                        },
                    },
                    MuiRadio: {
                        styleOverrides: {
                            root: {
                                color: '#efefef',
                                '&.Mui-checked': {
                                    color: '#fafafa',
                                },
                            },
                        },
                    },
                    MuiCheckbox: {
                        styleOverrides: {
                            root: {
                                color: '#efefef',
                                '&.Mui-checked': {
                                    color: '#fafafa',
                                },
                            },
                        },
                    },
                })
        },
    };
};