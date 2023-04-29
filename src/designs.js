export function getDesignTokens(mode) {
    return {
        palette: {
            mode,
            ...(mode === 'light'
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
                        main: '#2F3136',
                    },
                    background: {
                        default: '#2F3136',
                        paper: '#212529',
                    },
                    text: {
                        primary: '#fafafa',
                        secondary: '#efefef',
                    },
                }),
        }, components: {
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '5px',
                        minHeight: '40px',
                        maxHeight: '40px',
                        '&.Mui-selected': {
                            backgroundColor: '#3F4248',
                        },
                        '&.Mui-selected:hover': {
                            backgroundColor: '#3F4248',
                        },
                    },
                },
            },
        },
    };
};