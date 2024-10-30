import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Popconfirm, Switch } from 'antd';

import { 
    getVersionIterators, 
    openVersionIterator,
    closeVersionIterator 
} from '../../actions/version_iterator';

class MySwitch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            defaultChecked: this.props.defaultChecked === 1,
        };
    }

    onChange = (checked: boolean) => {
        this.setState({defaultChecked: checked});
        if (checked) {
            openVersionIterator(this.props.uuid, ()=>{
                getVersionIterators(this.props.dispatch); 
            });
        } else {
            closeVersionIterator(this.props.uuid, ()=>{
                getVersionIterators(this.props.dispatch); 
            });
        }
    };

    render() : ReactNode {
        return (this.state.defaultChecked ?
            <Popconfirm
                title="关闭迭代"
                description="关闭迭代后无法更新该迭代下的 api，确定关闭吗？"
                onConfirm={e => {
                    this.onChange(false);
                }}
                onCancel={e => {
                    this.setState({defaultChecked: true})
                }}
                onOpenChange={(_, e) => {
                    e?.stopPropagation();
                }}
                disabled={!this.state.defaultChecked}
                okText="关闭"
                cancelText="取消"
            >
                <Switch value={this.state.defaultChecked} />
            </Popconfirm>
            :
            <Switch value={this.state.defaultChecked} onChange={this.onChange} />
        )
    }

}

function mapStateToProps (state) {
    return {
    }
}
  
export default connect(mapStateToProps)(MySwitch);