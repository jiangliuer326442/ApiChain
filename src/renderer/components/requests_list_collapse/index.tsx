import { Component, ReactNode } from 'react';
import { Collapse } from 'antd';

import RequestListCollapseChildren from '@comp/requests_list_collapse/children';
import RequestListCollapseExtra from '@comp/requests_list_collapse/extra';

class RequestListCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items : [
            ]
        }
    }

    async componentDidMount() {
        this.buildFolders();
    }

    async componentDidUpdate(prevProps) {
        let prevFolders = prevProps.folders;
        if (prevFolders === undefined) {
            prevFolders = [];
        }
        let currentFolders = this.props.folders;
        if (currentFolders === undefined) {
            currentFolders = [];
        }
        if (prevFolders.length !== currentFolders.length) {
            this.buildFolders();
        }
    }

    buildFolders = () => {
        let currentFolders = this.props.folders;
        if (currentFolders === undefined) {
            currentFolders = [];
        }
        let items = [];
        for (let _fold of currentFolders) {
            let item = {};
            item.key = _fold.value;
            item.label = _fold.label;
            item.children = <RequestListCollapseChildren 
                folders={this.props.folders}
                metadata={this.props.metadata} 
                filterTitle={this.props.filterTitle}
                filterUri={this.props.filterUri}
                folder={_fold.value} 
            />;
            item.extra = <RequestListCollapseExtra metadata={this.props.metadata} folder={_fold.value} />;
            items.push(item);
        }
        this.setState({
            items : items
        });
    }

    render() : ReactNode {
        return (
            <Collapse accordion items={this.state.items} />
        )
    }
}

export default RequestListCollapse;