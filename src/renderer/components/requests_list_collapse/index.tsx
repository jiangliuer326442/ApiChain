import { Component, ReactNode } from 'react';
import { Collapse } from 'antd';

import { FoldSourceIterator, FoldSourcePrj } from '@conf/global_config';
import RequestListCollapseChildren from '@comp/requests_list_collapse/children';
import RequestListCollapseExtra from '@comp/requests_list_collapse/extra';

function buildFolders(
    currentFolders,
    allFolders,
    filterTitle,
    filterUri,
    metadata,
    refreshCallback,
) {
    if (currentFolders === undefined) {
        currentFolders = [];
    }
    let items = [];
    for (let _fold of currentFolders) {
        let type = "";
        if (_fold.value.indexOf(FoldSourcePrj) === 0) {
            type = "prj";
        } else if (_fold.value.indexOf(FoldSourceIterator) === 0) {
            type = "iterator"
        }

        let item : any = {};
        item.key = _fold.value;
        item.label = _fold.label;
        item.children = <RequestListCollapseChildren 
            folders={allFolders}
            metadata={metadata} 
            filterTitle={filterTitle}
            filterUri={filterUri}
            folder={_fold.value} 
            type={ type }
            refreshCallback={() => refreshCallback()}
        />;
        item.extra = <RequestListCollapseExtra 
            metadata={metadata} 
            folder={_fold.value} 
            type={ type }
            refreshCallback={() => refreshCallback()}
        />;
        items.push(item);
    }
    return items;
}


class RequestListCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterTitle: props.filterTitle,
            filterUri: props.filterUri,
            items : [
            ]
        }
    }

    async componentDidMount() {
        let items = buildFolders(
            this.props.folders,
            this.props.allFolders,
            this.props.filterTitle,
            this.props.filterUri,
            this.props.metadata,
            this.props.refreshCallback,
        );
        this.setState({
            items : items
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.filterTitle !== prevState.someProp || nextProps.filterUri !== prevState.filterUri) {
            let items = buildFolders(
                nextProps.folders,
                nextProps.allFolders,
                nextProps.filterTitle,
                nextProps.filterUri,
                nextProps.metadata,
                nextProps.refreshCallback,
            );
            return { 
                filterTitle: nextProps.filterTitle, 
                filterUri: nextProps.filterUri, 
                items 
            };
        }
        return null;
    }

    render() : ReactNode {
        return (
            <Collapse accordion items={this.state.items} />
        )
    }
}

export default RequestListCollapse;