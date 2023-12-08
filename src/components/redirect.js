import React from 'react';

class Redirect extends React.Component {
    componentDidMount() {
        const { to } = this.props;
        window.location.href = to;
    }

    render() {
        return null;
    }
}

export default Redirect;