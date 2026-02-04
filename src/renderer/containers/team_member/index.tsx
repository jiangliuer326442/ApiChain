import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

class TeamMember extends Component {

    constructor(props) {
        super(props);
    }

    render(): ReactNode {
        return (
            <h1>Team Member Page</h1>
        )
    }

}

function mapStateToProps (state) {
    return {
    }
}

export default connect(mapStateToProps)(TeamMember);