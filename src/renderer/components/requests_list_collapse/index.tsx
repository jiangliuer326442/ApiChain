import { Component, ReactNode } from 'react';
import { Collapse } from 'antd';

import { FoldSourceIterator, FoldSourcePrj } from '@conf/global_config';
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
        let filterTitle = this.props.filterTitle;
        let filterUri = this.props.filterUri;
        let items = [];
        for (let _fold of currentFolders) {
            let type = "";
            if (_fold.value.indexOf(FoldSourcePrj) === 0) {
                type = "prj";
            } else if (_fold.value.indexOf(FoldSourceIterator) === 0) {
                type = "iterator"
            }

            let item = {};
            item.key = _fold.value;
            item.label = _fold.label;
            item.children = <RequestListCollapseChildren 
                folders={this.props.folders}
                metadata={this.props.metadata} 
                filterTitle={filterTitle}
                filterUri={filterUri}
                folder={_fold.value} 
                type={ type }
                refreshCallback={() => this.props.refreshCallback()}
            />;
            item.extra = <RequestListCollapseExtra 
                metadata={this.props.metadata} 
                folder={_fold.value} 
                type={ type }
                refreshCallback={() => this.props.refreshCallback()}
            />;
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