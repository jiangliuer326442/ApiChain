import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Popconfirm, Switch } from 'antd';

import {
    openVersionIterator,
    closeVersionIterator 
} from '@act/version_iterator';
import { langTrans } from '@lang/i18n';

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
                this.props.cb();
            });
        } else {
            closeVersionIterator(this.props.uuid, ()=>{
                this.props.cb();
            });
        }
    };

    render() : ReactNode {
        return (this.state.defaultChecked ?
            <Popconfirm
                title={langTrans("iterator close title")}
                description={langTrans("iterator close desc")}
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
                okText={langTrans("iterator close sure")}
                cancelText={langTrans("iterator close cancel")}
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